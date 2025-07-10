const fs = require("fs");
const path = require("path");

const check = () => {
  // Load .env file
  const envPath = path.join(__dirname, "../../.env");
  const schemaPath = path.join(__dirname, "../../env.schema.json");

  const envFile = fs.readFileSync(envPath, "utf8");
  const schemaFile = fs.readFileSync(schemaPath, "utf8");

  // Parse .env into key-value pairs
  const envKeys = envFile
    .split("\n")
    .map((line) => line.split("=")[0].trim())
    .filter((key) => key && !key.startsWith("#"));

  // Parse JSON schema
  const schemaKeys = JSON.parse(schemaFile).keys.map((entry) => entry.key);

  // Find missing and extra keys
  const missingKeys = schemaKeys.filter((key) => !envKeys.includes(key));
  const extraKeys = envKeys.filter((key) => !schemaKeys.includes(key));

  if (missingKeys.length > 0) {
    console.log("\t🟥 Missing keys in .env :", missingKeys);
  } else {
    console.log("\t🟩 No missing keys");
  }

  if (extraKeys.length > 0) {
    console.log("\t🟥 Extra keys in .env:", extraKeys);
  } else {
    console.log("\t🟩 No extra keys");
  }
};

const createEnv = () => {
  if (fs.existsSync(path.join(__dirname, "../../.env"))) {
    console.log(".env already exists");
  } else {
    try {
      const schemaPath = path.join(__dirname, "../../env.schema.json");

      const schemaFile = fs.readFileSync(schemaPath, "utf8");

      const newEnv = JSON.parse(schemaFile).keys.map((key) => {
        return `${key.key} = ${key.example}`;
      });

      fs.writeFileSync(
        path.join(__dirname, "../../.env"),
        newEnv.join("\n").toString()
      );
    } catch (err) {
      console.error(err);
    }
  }
};

const args = process.argv.slice(2);

if (args[0] === "gen_env") {
  createEnv();
}

const doctor = async (code = null) => {
  console.log("🟧 Running Tests");

  try {
    if (!fs.existsSync(path.join(__dirname, "../../.env"))) {
      console.error("🟥 Environment Variables Missing");
    } else {
      console.log("🟩 Environment");
    }
  } catch (err) {
    if (code) throw Error("Environment Variable not Found");
  }

  try {
    check();
  } catch (err) {
    // console.error("🟥 Error checking environment variables");
    if (code) throw Error("Error checking environment variables");
  }

  try {
    if (!fs.existsSync(path.join(__dirname, "../keys/public.key"))) {
      console.error("🟥 Public Key Missing");
    } else {
      console.log("🟩 Public Key Found");
    }
  } catch (err) {
    if (code) throw Error("Error checking publiv keys");
  }

  try {
    if (
      !fs.existsSync(path.join(__dirname, "../keys/firebase_admin_key.json"))
    ) {
      console.error("🟥 Firebase Service Account Credentials Missing");
    } else {
      console.log("🟩 Creds Found \n");
    }
  } catch (err) {
    console.log("🟥 Error checking Firebase Credentials");
    if (code) throw Error("Error checking Firebase Credentials");
  }
};

if (args[0] === "doctor") {
  doctor();
}

module.exports = doctor;
