create schema if not exists db;

use db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users ADD UNIQUE (username);

INSERT IGNORE INTO users (username, password) 
VALUES ('marga','1234'), ('coty','abcd');