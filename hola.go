package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	//obtener configuración de variables de entorno
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "margoch")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "db")

	dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("No se pudo conectar a MySQL:", err)
	}

	r := gin.Default()

	// Habilitar CORS para desarrollo
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	//endpoint hola mundo
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hola somos Marga y Coty")
	})

	//endpoint: lista usuarios
	r.GET("/users", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, username, password FROM users")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		type User struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
			Password string `json:"password"`
		}
		var users []User
		for rows.Next() {
			var u User
			if err := rows.Scan(&u.ID, &u.Username, &u.Password); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			users = append(users, u)
		}
		c.JSON(200, users)
	})

	r.GET("/health", func(c *gin.Context) {
    c.JSON(200, gin.H{
        "ok":  true,
        "env": os.Getenv("APP_ENV"),
    })
})

	//crear usuario
	r.POST("/users", func(c *gin.Context) {
		var input struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		//validar JSON recibido
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Se requieren 'username' y 'password'"})
			return
		}

		//insertar en la DB
		result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", input.Username, input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{
			"message":  "Usuario creado con éxito",
			"id":       id,
			"username": input.Username,
		})
	})

	//levantar servidor
	r.Run(":8081")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
