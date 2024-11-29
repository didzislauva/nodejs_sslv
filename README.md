Here’s a comprehensive `README.md` for your app to use on GitHub:

---

# **Real Estate Ad Scraping and Loop Controller**

This application is designed to scrape real estate ads from the SS.lv website, manage scraping loops through a user-friendly GUI, and store ad data in a database. The app dynamically manages multiple scraping tasks, allowing users to start, stop, and remove loops via the GUI.

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
- **Database:** SQLite  
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
   - Create an SQLite database file (e.g., `database.db`) with the required schema:
     ```sql
     CREATE TABLE ads (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       ad_key TEXT UNIQUE NOT NULL,
       link TEXT NOT NULL,
       posting_date DATE NOT NULL,
       location TEXT NOT NULL,
       sublocation TEXT NOT NULL,
       renewals INTEGER DEFAULT 0,
       last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
     );
     ```

4. Start the application:
   ```bash
   node app.js
   ```

5. Open the app in your browser:
   ```
   http://localhost:3000
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

## **Code Structure**

### **1. Backend**

#### `app.js`  
- Initializes the server and routes.  
- Handles global loop storage and middleware.

#### `routes/loopRouter.js`  
- Manages loop-related endpoints (`/add`, `/start`, `/stop`, `/remove`, `/`).

#### `controllers/loopController.js`  
- Handles loop operations (adding, starting, stopping, removing).  
- Integrates with `adsController` for ad scraping.

#### `controllers/adsController.js`  
- Contains scraping logic for fetching and processing ads.  
- Splits logic into reusable helpers for direct invocation and API endpoints.

#### `models/adsModel.js`  
- Database interaction layer for managing ads.  
- Functions include fetching recent ads, inserting new ads, updating renewals, and refreshing `last_seen`.

---

### **2. Frontend**

#### `views/loops.ejs`  
- Provides a GUI for managing loops.  
- Dynamically displays the current list of loops and their statuses.  
- Supports adding, starting, stopping, and removing loops.

#### `public/`  
- Contains static files (e.g., CSS, JavaScript).

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

## **Contributing**

1. Fork the repository.  
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Feel free to use this template and adjust it to match your specific project details or any additional features you add! Let me know if you'd like further help.
