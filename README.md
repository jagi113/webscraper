# Django Universal Scraper  

## 🚀 Overview  
**Django Universal Scraper** offers a user-friendly web interface for scraping data from any website. Users can create a project, provide the URL of the first page to scrape, and specify the number of pages they wish to extract data from.

The process begins by scraping the HTML content of the first page and identifying repetitive components that contain the desired data. In specific cases, the entire page might be considered a single component. To accurately define components, users must use CSS or XPath selectors.

Once the components are identified, users can create individual data fields by selecting specific elements within a component using CSS or XPath selectors and assigning field names. To simplify this process, a built-in helper tool allows users to copy sample data directly from a component, which then generates the appropriate selector automatically.

After defining the fields, users can review their project settings and proceed with data extraction. The Scraped Data page displays the extracted data in a table, where column names correspond to the user-defined fields. Since the same data or pages may be scraped multiple times, the tool allows users to remove duplicate records based on selected columns. Finally user can export scraped data in xlsx format.

Limitations:
This software does not support setting custom headers for scraping, bypassing human verification, modifying data during or after extraction. 

## 🌟 Features  
- **Project-Based Scraping** – Users can create separate projects for different scraping tasks.  
- **Intuitive Component Selection** – Define data components using **CSS or XPath selectors**.  
- **Automated Field Identification** – A helper tool simplifies data field selection.  
- **Duplicate Handling** – Remove repeated data entries based on selected columns.  
- **Task Management** – Uses **Celery** for handling background tasks.  
- **Modern Frontend** – Built with **StimulusJS Frames & Streams** and **Tailwind CSS**.  

## 🛠️ Technologies Used  

### **Backend & General Stack**  
- **Python, Django**  

### **Frontend**  
- **JavaScript (Stimulus Frames & Streams), Tailwind CSS**  

### **Scraping Tools**  
- **Requests (Python Library)**  
- **BeautifulSoup**  
- **Scrapy**  

### **Databases & Caching**  
- **SQLite** – One database for projects using **Django ORM**, a second for scraped data.  
- **Redis** – Used for Celery task queue management.  
- **Django Cache** – Implements caching for performance optimization.  

### **DevOps & Deployment**  
- **Docker** – Containerization for easy deployment.  
- **Nginx** – Serves static files and redirects requests to Django.  
- **Celery** – Manages background tasks efficiently.  

## 📦 Installation & Setup  

### **Prerequisites**  
Ensure you have the following installed:  
- Python 3.x  
- Docker & Docker Compose  
- Redis  

### **Installation Steps**  

1. **Clone the Repository**  
   ```sh
   git clone https://github.com/yourusername/django-universal-scraper.git
   cd django-universal-scraper
   ```

2. **Set Up Environment Variables**  
   Copy the `.env.example` file and update it with your settings:  
   ```sh
   cp .env.example .env
   ```

3. **Start the Project with Docker** 
    ``` sh
    docker compose up --build
    ```

4. **Run Database Migrations**
    ```sh
    docker compose exec webscraper-webscraper-1 python manage.py migrate
    ```

5. **Create a Superuser (Optional, for Admin Access)**
    ```sh
    docker compose exec webscraper-webscraper-1 python manage.py createsuperuser
    ```

6. **Access the Web Interface**
Open http://localhost:8003 in your browser.



## 📖 Usage Guide  

1. **Create a New Scraping Project** – Define the website URL, specify identifier type (CSS or xPath), first page number to scrape and the number of pages to scrape.  
2. **Identify Components & Fields** – Use **CSS/XPath selectors** to target specific data fields.  
3. **Run the Scraper** – Extract data and view the results in a structured table.  
4. **Manage Data** – Remove duplicate records based on selected columns.  



## 🚫 Scope & Limitations  

The current version does **not** support:  

- Setting custom headers for requests.  
- Bypassing CAPTCHA/human verification.  
- Editing data after extraction.  
- Exporting data to external formats (CSV, JSON, etc.).  


## 🤝 Contributing  

Contributions are welcome! Please follow these steps:  

1. **Fork the repository.**  
2. **Create a feature branch:**  
   ```sh
   git checkout -b feature-name
   ```
3. **Commit your changes: 
   ```sh
   git commit -m "Add feature"
   ```
4. **Push to your branch:**  
   ```sh
   git push origin feature-name
   ```
5. **Open a Pull Request.**  


## 📜 License  
This project is licensed under the **MIT License**.  


## 📬 Contact  
For questions or suggestions, feel free to reach out:  

- **GitHub:** [jagi113](https://github.com/jagi113)  
- **Portfolio:** [jaroslavgirovsky.website](https://jaroslavgirovsky.website)  
