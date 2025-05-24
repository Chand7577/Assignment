import express from "express";
import { getDistance } from "geolib";
import { database } from "./db.js";

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());

// customized middlware to validate school data before insertion

function validateData(req, res, next) {
  const { name, address, latitude, longitude } = req.body;

  if (!name || typeof name !== "string")
    return res.status(404).json({ message: "Name is required!" });

  if (!address || typeof address !== "string")
    return res.status(404).json({ message: "Address is required!" });

  if (latitude == undefined || typeof latitude !== "number")
    return res
      .status(404)
      .json({ message: "Latitude is required and must be a number!" });

  if (longitude == undefined || typeof longitude !== "number")
    return res
      .status(404)
      .json({ message: "Longitude is required and must be a number!" });

  next();
}

//calculates the distance between the user location and each of the  school's location

function calDistance(lat1, long1, lat2, long2) {
  lat1 = parseFloat(lat1);
  long1 = parseFloat(long1);

  const distance =
    getDistance(
      { latitude: lat1, longitude: long1 },
      { latitude: lat2, longitude: long2 }
    ) / 1000;
  return distance;
}

// POST method to  add a new school

app.post("/addSchool", validateData, (req, res) => {
  // query database
  const { name, address, latitude, longitude } = req.body;
  const values = [name, address, latitude, longitude];

  const sql_query =
    "insert into  school (name, address,latitude,longitude) Values(?,?,?,?)";

  database.query(sql_query, values, (err) => {
    if (err) {
      console.log("Insert error", err);
    } else {
      res.status(201).json({ message: "School info added successfully!" });
    }
  });
});

// GET method would return list of schools

app.get("/listSchools", (req, res) => {
  const { lat, long } = req.query;

  if (!lat || !long) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  database.query("select * from school", (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    } else {
      let schools = [];
      result.map((school) => {
        let distance = calDistance(
          lat,
          long,
          school.latitude,
          school.longitude
        );

        schools.push({
          name: school.name,
          distance: distance,
          latitude: school.latitude,
          longitude: school.longitude,
        });
      });

      // sorts the distance
      schools.sort((school1, school2) => school1.distance - school2.distance);

      return res.status(200).json(schools);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
