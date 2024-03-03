let pg = require("pg");
let express = require("express");
let client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_ice_cream_db"
);
let app = express();

let init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `
    DROP TABLE IF EXISTS theodore_sinclair_s_favorite_ice_cream_flavors;
    CREATE TABLE theodore_sinclair_s_favorite_ice_cream_flavors(
        id SERIAL PRIMARY KEY,
        name TEXT,
        ultimate_favorite BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
  `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name, ultimate_favorite) VALUES('Candied Citrus Peel', true);
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name, ultimate_favorite) VALUES('Lavender Honey', true);
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name) VALUES('Rose Water & Pistachio');
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name) VALUES('Quince & Marmalade Ripple');
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name) VALUES('Port Wine & Fig');
  INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors(name, ultimate_favorite) VALUES('Clotted Cream & Strawberry', true);
  `;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

app.use(express.json());
app.use(require("morgan")("dev"));
app.get("/api/flavors", async (req, res, next) => {
  try {
    let SQL = `
        SELECT * FROM theodore_sinclair_s_favorite_ice_cream_flavors ORDER BY created_at DESC;
    `;
    let response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    let SQL = `
                SELECT * FROM theodore_sinclair_s_favorite_ice_cream_flavors WHERE id=$1;
            `;
    let response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
app.post("/api/flavors", async (req, res, next) => {
  try {
    let SQL = `
            INSERT INTO theodore_sinclair_s_favorite_ice_cream_flavors (name) VALUES ($1) RETURNING *;
        `;
    let response = await client.query(SQL, [req.body.name]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    let SQL = `
                UPDATE theodore_sinclair_s_favorite_ice_cream_flavors SET name=$1, ultimate_favorite=$2, updated_at=now() WHERE id=$3 RETURNING *;
            `;
    let response = await client.query(SQL, [
      req.body.name,
      req.body.ultimate_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    let SQL = `
                    DELETE FROM theodore_sinclair_s_favorite_ice_cream_flavors WHERE id=$1;
                `;
    let response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
