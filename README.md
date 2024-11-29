
# **Real Estate Ad Scraping and Loop Controller**

This application is designed to scrape real estate ads from the SS.lv website, manage scraping loops through a user-friendly GUI, and store ad data in a database. The app dynamically manages multiple scraping tasks, allowing users to start, stop, and remove loops via the GUI.

This script optimizes the scraping process by maintaining a loop-based approach, ensuring that ads are scraped only when necessary. By focusing on the most recent ads for each configured location and sublocation, it minimizes redundant requests to the target website, reducing server load and improving efficiency. Additionally, it immediately processes new or updated ads while skipping unchanged ones, further streamlining the workflow and conserving resources.

---

## **Features**

1. **Scrape Ads Dynamically**  
   - Fetch ads based on location, sublocation, and action (e.g., sell or rent).  
   - Store new and renewed ads in a database.  
   - Update `last_seen` for existing ads.

2. **Loop Management GUI**  
   - Add scraping loops with parameters (location, sublocation, action, interval).  
   - Start, stop, and remove loops dynamically.  
   - View the status of active loops.

3. **Interval-Based Scraping**  
   - Execute immediate ad scraping when a loop is started.  
   - Perform subsequent scraping at user-defined intervals (e.g., hourly).

4. **Database Integration**  
   - Store ad data with unique keys.  
   - Maintain posting dates, renewal counts, and last seen timestamps.

---

## **Tech Stack**

- **Backend:** Node.js, Express.js  
- **Frontend:** EJS (Embedded JavaScript templates), HTML, CSS, JavaScript  
- **Database:** MySQL or MariaDB  
- **Web Scraping:** Cheerio, Axios  

---

## **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nodejs_sslv.git
   cd nodejs_sslv
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a MySQL/MariaDB database and user.
   - Grant the user appropriate privileges on the database.
   - Update the database connection configuration in `dbConnection.js` to match your setup:
     ```javascript
     const pool = mysql.createPool({
       host: 'your-host',          // Database host (e.g., localhost)
       user: 'your-username',      // Database username
       password: 'your-password',  // Database password
       database: 'your-database',  // Database name
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0,
     });
     ```

   Example SQL commands to set up the database:
   ```sql
   CREATE DATABASE sslv;

   CREATE USER 'sslv'@'localhost' IDENTIFIED BY 'your-password';

   GRANT ALL PRIVILEGES ON sslv.* TO 'sslv'@'localhost';

   FLUSH PRIVILEGES;
   ```

4. Initialize the database schema:
   - Run the following SQL commands to create the required tables:
     ```sql
     CREATE TABLE ads (
       id INT AUTO_INCREMENT PRIMARY KEY,
       ad_key VARCHAR(255) UNIQUE NOT NULL,
       link TEXT NOT NULL,
       posting_date DATE NOT NULL,
       location VARCHAR(255) NOT NULL,
       sublocation VARCHAR(255) NOT NULL,
       renewals INT DEFAULT 0,
       last_seen DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     );
     ```

5. Start the application:
   ```bash
   node app.js
   ```

6. Open the app in your browser:
   ```
   http://localhost:3000
   ```

---

## **Database Configuration**

The application uses a connection pool (`mysql2/promise`) for efficient interaction with the MySQL/MariaDB database. Ensure the following parameters in `dbConnection.js` are correctly configured:

- **`host`:** The database host (e.g., `localhost` for local development).  
- **`user`:** The database username with sufficient privileges.  
- **`password`:** The password for the database user.  
- **`database`:** The name of the database to store scraped ads.  

Example configuration in `dbConnection.js`:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'sslv',
  password: 'your-password',
  database: 'sslv',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

---

## **Usage**

### **1. Loop Management GUI**
- **Add a Loop:**  
  Use the dropdowns and interval input to create a new scraping loop.

- **Start/Stop a Loop:**  
  Control scraping loops with the "Start" and "Stop" buttons.

- **Remove a Loop:**  
  Click "Remove" to delete a loop and its scheduled scraping tasks.

### **2. Scraping Ads**
- Ads are scraped immediately when a loop is started.
- Subsequent scrapes are executed at the interval specified during loop creation.
- Ads are processed as follows:
  - **New Ads:** Inserted into the database.
  - **Renewed Ads:** Posting date is updated.
  - **Matched Ads:** `last_seen` is updated.

---

## **Endpoints**

### **Loop Routes (`/loops`)**
| Method | Route       | Description              |
|--------|-------------|--------------------------|
| POST   | `/add`      | Add a new loop.          |
| POST   | `/start`    | Start a loop.            |
| POST   | `/stop`     | Stop a loop.             |
| POST   | `/remove`   | Remove a loop.           |
| GET    | `/`         | Fetch all active loops.  |

### **Ad Routes (`/ads`)**
| Method | Route                        | Description                       |
|--------|------------------------------|-----------------------------------|
| GET    | `/:action/:location/:sublocation` | Scrape ads for specified parameters. |

---

## **Future Enhancements**

1. **User Authentication:**  
   Add user roles to manage access to the loop controller.

2. **Enhanced Frontend:**  
   Display scraped ads directly in the GUI.

3. **Error Notifications:**  
   Alert users of scraping or database errors.

4. **Persistent Loop Storage:**  
   Save loop configurations in the database to retain them across server restarts.

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
