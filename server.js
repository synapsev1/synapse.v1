const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const multer = require("multer");
const app = express();
const PORT = 3000;
const ADMIN_USER = "kushalhost";
const ADMIN_PASS = "Synapsebanger";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.redirect("/dashboard.html");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.get("/dashboard.html", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    res.redirect("/");
  }
});
// Register the custom font
registerFont(path.resolve(__dirname, "public", "fonts", "Expansiva bold.otf"), {
  family: "ExpansivaBold",
});
registerFont(path.resolve(__dirname, "public", "fonts", "Expansiva.otf"), {
  family: "Expansiva",
});
registerFont(
  path.resolve(__dirname, "public", "fonts", "Expansiva italic.otf"),
  { family: "ExpansivaItalic" }
);

function generateInvitationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post(
  "/api/create-ticket",
  upload.single("profilePicture"),
  async (req, res) => {
    const { name, date, time, purchasedFrom, place, isVIP } = req.body;
    const invitationCode = generateInvitationCode();

    const profilePicture = req.file
      ? `data:image/png;base64,${req.file.buffer.toString("base64")}`
      : "";

    try {
      const ticket = {
        name,
        date,
        time,
        purchasedFrom,
        place,
        invitationCode,
        isVIP: isVIP === "on", // Store whether the ticket is VIP or not
        status: "Paid",
        profilePicture,
        alreadyEntered: false,
      };

      const attendeesPath = path.join(__dirname, "data", "attendees.json");
      let attendees = [];
      if (fs.existsSync(attendeesPath)) {
        attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));
      }
      attendees.push(ticket);
      fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));

      const canvasWidth = 1080;
      const canvasHeight = 1080;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Choose background based on VIP status
      const backgroundImagePath =
        isVIP === "on"
          ? path.join(__dirname, "public", "images", "vipbg.png")
          : path.join(__dirname, "public", "images", "bg.jpg");

      // Load background image
      const background = await loadImage(backgroundImagePath);
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // Load and draw logo
      const logo = await loadImage(
        path.join(__dirname, "public", "images", "logo.png")
      );
      ctx.drawImage(logo, 30, 30, 150, 150);

      // Draw profile picture if provided
      if (profilePicture) {
        const profileImg = await loadImage(profilePicture);
        // Resize and draw profile picture as a square
        const profilePicSize = 200; // Size of the square profile picture
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          canvasWidth - profilePicSize - 30,
          210,
          profilePicSize,
          profilePicSize
        );
        ctx.clip();
        ctx.drawImage(
          profileImg,
          canvasWidth - profilePicSize - 30,
          210,
          profilePicSize,
          profilePicSize
        );
        ctx.restore();
      }

      // Draw unique code in a white box
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(canvasWidth - 170, 60, 150, 50);
      ctx.fillStyle = "#000000";
      ctx.font = "normal 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(invitationCode, canvasWidth - 95, 85);

      // Set text styling
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "normal 32px ExpansivaBold";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Add text shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      // Draw text on canvas
      const textStartX = 30;
      const textStartY = 200;
      const lineHeight = 50;

      ctx.fillText(`Name: ${name}`, textStartX, textStartY);
      ctx.fillText(`Date: ${date}`, textStartX, textStartY + lineHeight);
      ctx.fillText(`Time: ${time}`, textStartX, textStartY + 2 * lineHeight);
      ctx.fillText(
        `Given By: ${purchasedFrom}`,
        textStartX,
        textStartY + 3 * lineHeight
      );
      ctx.fillText(`Place: ${place}`, textStartX, textStartY + 4 * lineHeight);
      ctx.fillText("Status: Paid", textStartX, textStartY + 5 * lineHeight);

      // Draw VIP or Regular label
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = isVIP === "on" ? "#FFD700" : "#FFFFFF"; // Gold for VIP, White for Regular
      ctx.fillText(
        isVIP === "on" ? "VIP Ticket" : "Regular Ticket",
        textStartX,
        textStartY + 6 * lineHeight
      );

      // Draw "Ya'll better pull up" line at the bottom with bold italic font
      ctx.font = "bold 27px ExpansivaItalic";
      ctx.textAlign = "center";
      ctx.fillText(
        "Ya'll better pull up, we'll be pleased",
        canvasWidth / 2,
        canvasHeight - 62
      );

      // Save ticket as PNG
      const ticketPath = path.join(
        __dirname,
        "data",
        "tickets",
        `${invitationCode}.png`
      );
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(ticketPath, buffer);

      res.redirect("/manage-tickets.html");
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/api/update-ticket",
  upload.single("profilePicture"),
  async (req, res) => {
    const updatedTicket = req.body;
    const profilePictureBuffer = req.file
      ? req.file.buffer
      : updatedTicket.profilePicture
      ? await loadImage(
          path.join(
            __dirname,
            "data",
            "images",
            "uploads",
            updatedTicket.profilePicture
          )
        )
      : null;

    try {
      const newInvitationCode = generateInvitationCode();

      const attendeesPath = path.join(__dirname, "data", "attendees.json");
      let attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));

      const oldInvitationCode = updatedTicket.invitationCode;
      const oldTicketPath = path.join(
        __dirname,
        "data",
        "tickets",
        `${oldInvitationCode}.png`
      );
      if (fs.existsSync(oldTicketPath)) {
        fs.unlinkSync(oldTicketPath);
      }

      attendees = attendees.map((ticket) =>
        ticket.invitationCode === oldInvitationCode
          ? {
              ...ticket,
              ...updatedTicket,
              invitationCode: newInvitationCode,
              profilePicture: profilePictureBuffer
                ? `/images/uploads/${newInvitationCode}.png`
                : null,
            }
          : ticket
      );
      fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));

      const canvasWidth = 1080;
      const canvasHeight = 1080;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(
        path.join(__dirname, "public", "images", "bg.jpg")
      );
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      const logo = await loadImage(
        path.join(__dirname, "public", "images", "logo.png")
      );
      ctx.drawImage(logo, 30, 30, 150, 150);

      if (profilePictureBuffer) {
        const profileImg = await loadImage(profilePictureBuffer);
        // Resize and draw profile picture as a square
        const profilePicSize = 200; // Size of the square profile picture
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          canvasWidth - profilePicSize - 30,
          210,
          profilePicSize,
          profilePicSize
        );
        ctx.clip();
        ctx.drawImage(
          profileImg,
          canvasWidth - profilePicSize - 30,
          210,
          profilePicSize,
          profilePicSize
        );
        ctx.restore();
      }

      // Draw unique code in a white box
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(canvasWidth - 170, 60, 150, 50);
      ctx.fillStyle = "#000000";
      ctx.font = "normal 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(newInvitationCode, canvasWidth - 95, 85);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "normal 32px ExpansivaBold";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      const textStartX = 30;
      const textStartY = 200;
      const lineHeight = 50;

      ctx.fillText(`Name: ${updatedTicket.name}`, textStartX, textStartY);
      ctx.fillText(
        `Date: ${updatedTicket.date}`,
        textStartX,
        textStartY + lineHeight
      );
      ctx.fillText(
        `Time: ${updatedTicket.time}`,
        textStartX,
        textStartY + 2 * lineHeight
      );
      ctx.fillText(
        `Given By: ${updatedTicket.purchasedFrom}`,
        textStartX,
        textStartY + 3 * lineHeight
      );
      ctx.fillText(
        `Place: ${updatedTicket.place}`,
        textStartX,
        textStartY + 4 * lineHeight
      );
      ctx.fillText("Status: Paid", textStartX, textStartY + 5 * lineHeight);

      ctx.font = "bold 27px ExpansivaItalic";
      ctx.textAlign = "center";
      ctx.fillText(
        "Ya'll better pull up, we'll be pleased",
        canvasWidth / 2,
        canvasHeight - 62
      );

      const newTicketPath = path.join(
        __dirname,
        "data",
        "tickets",
        `${newInvitationCode}.png`
      );
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(newTicketPath, buffer);

      res.redirect("/manage-tickets.html");
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.get("/api/attendees", (req, res) => {
  try {
    const attendees = JSON.parse(
      fs.readFileSync("data/attendees.json", "utf8")
    );

    // No need to convert profile picture, it's already a Base64 string
    res.json(attendees);
  } catch (error) {
    console.error("Error reading attendees:", error);
    res.status(500).json({ error: "Failed to load attendees" });
  }
});

app.post("/api/clear-tickets", (req, res) => {
  fs.writeFileSync("data/attendees.json", JSON.stringify([], null, 2));
  console.log("Request for clear tickets received");
  const ticketDir = path.join(__dirname, "data", "tickets");
  fs.readdir(ticketDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(ticketDir, file), (err) => {
        if (err) throw err;
      });
    }
  });

  res.sendStatus(200);
});

// Delete a ticket
app.post("/api/delete-ticket", (req, res) => {
  const { uniqueCode } = req.body;

  let attendees = JSON.parse(fs.readFileSync("data/attendees.json", "utf8"));
  attendees = attendees.filter((ticket) => ticket.uniqueCode !== uniqueCode);

  fs.writeFileSync("data/attendees.json", JSON.stringify(attendees, null, 2));

  const ticketPath = path.join(
    __dirname,
    "data",
    "tickets",
    `${uniqueCode}`.png
  );
  if (fs.existsSync(ticketPath)) {
    fs.unlinkSync(ticketPath);
  }

  res.sendStatus(200);
});

app.post("/api/validate-invitation-code", (req, res) => {
  const { invitationCode } = req.body;
  const attendeesPath = path.join(__dirname, "data", "attendees.json");

  if (fs.existsSync(attendeesPath)) {
    const attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));
    const attendee = attendees.find(
      (ticket) => ticket.invitationCode === invitationCode
    );

    if (attendee) {
      const ticketStatus = attendee.vip ? "VIP" : "Regular";

      if (attendee.alreadyEntered) {
        return res.json({
          valid: true,

          attendee,
          ticketStatus,
        });
      } else {
        return res.json({
          valid: true,
          alreadyEntered: false,
          attendee,
          ticketStatus,
        });
      }
    }
  }

  res.json({
    valid: false,
    message: "Invalid invitation code or ticket not found.",
  });
});

app.post("/api/verify-invite-code", (req, res) => {
  const { invitationCode } = req.body;
  const attendeesPath = path.join(__dirname, "data", "attendees.json");

  if (fs.existsSync(attendeesPath)) {
    const attendees = JSON.parse(fs.readFileSync(attendeesPath, "utf8"));
    const attendee = attendees.find(
      (ticket) => ticket.invitationCode === invitationCode
    );

    if (attendee) {
      const ticketStatus = attendee.vip ? "VIP" : "Regular";

      if (attendee.alreadyEntered) {
        return res.json({
          success: false,
          message: "Ticket already verified.",
          ticketStatus,
        });
      } else {
        // Update the `alreadyEntered` flag to `true`
        attendee.alreadyEntered = true;

        // Save the updated attendees list back to the JSON file
        fs.writeFileSync(attendeesPath, JSON.stringify(attendees, null, 2));

        return res.json({
          success: true,
          message: "Ticket verified successfully.",
          ticketStatus,
        });
      }
    }
  }

  res.json({
    success: false,
    message: "Invalid invitation code or ticket not found.",
  });
});

const ticketsDirectory = path.join(__dirname, "data", "tickets");

app.get("/api/ticket/:invitationCode", (req, res) => {
  const { invitationCode } = req.params;
  const ticketPath = path.join(ticketsDirectory, `${invitationCode}.png`);

  fs.access(ticketPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        `Ticket image not found for invitationCode: ${invitationCode}`
      );
      return res.status(404).send("Ticket image not found");
    }

    res.sendFile(ticketPath);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
