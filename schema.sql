CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  phone_number VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  postal_code VARCHAR(20),
  project_details TEXT,
  detailed_requirements TEXT
);
