import mysql.connector

try:
    print("Attempting to connect to MySQL...")
    mydb = mysql.connector.connect(
      host="localhost",
      user="root",
      password="arun@2800"
    )
    print("Connected to MySQL Server!")
    
    mycursor = mydb.cursor()
    
    print("Creating database heatshield if not exists...")
    mycursor.execute("CREATE DATABASE IF NOT EXISTS heatshield")
    print("Database ensured.")
    
    mydb.close()
    print("Setup complete.")
    
except mysql.connector.Error as err:
    print(f"Error: {err}")
except Exception as e:
    print(f"Unexpected error: {e}")
