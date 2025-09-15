# 1. Elegir y preparar tu aplicación

## 1. App elegida
**API web simple en Go (Golang) con Gin.**
Endpoints:
- GET / → “Hola somos Marga y Coty”
- GET /users → lista usuarios (desde MySQL)
- POST /users → alta de usuario

## 2. Repositorio en git
- **Repositorio:** `https://github.com/margarita0912/IngDeSoft3-TP2-DOCKER.git`


# 2. Archivo Dockerfile

## 1.Dockerfile
    El Dockerfile utilizado para containerizar la aplicación es el siguiente:

    FROM golang:1.23

    WORKDIR /app
    COPY go.mod go.sum ./
    RUN go mod download

    COPY . .
    RUN go build -o server .

    EXPOSE 8081
    CMD ["./server"]

## 2. Explicación línea por línea
- **`FROM golang:1.23`**  
  Imagen oficial y versionada, asegura toolchain estable y reproducible.
  Compatibilidad con dependencias (driver MySQL go-sql-driver/mysql).
- **`WORKDIR /app`**  
  Define el directorio de trabajo dentro del contenedor como `/app`.
- **`COPY go.mod go.sum ./`**  
  Copia los archivos que definen las dependencias del proyecto.
- **`RUN go mod download`**  
  Descarga todas las dependencias listadas en `go.mod`.
- **`COPY . .`**  
  Copia todos los archivos del proyecto dentro del directorio de trabajo `/app` en el contenedor.
- **`RUN go build -o server .`**  
  Compila la aplicación Go y genera un binario llamado `server`.
- **`EXPOSE 8081`**  
  Documenta que la aplicación escucha en el puerto `8081`.
- **`CMD ["./server"]`**  
  Define el comando por defecto que se ejecutará al iniciar el contenedor: en este caso, correr el binario `server`. Así, al hacer `docker run` la aplicación se levanta automáticamente sin necesidad de parámetros adicionales.

## 3. Tag de imagen
- **comando:** "docker build -t margarita0912/hola-gin:tp2 ."
- con el -t etiquete la imagen con mi usuario y el tag tp2.

# 3. Publicación en Docker Hub y estrategia de versionado

## 1. Publicación
La imagen se construyó y publicó en la cuenta de Docker Hub:
- **login:** docker login
- **build con etiqueta significativa:** docker build -t margarita0912/hola-gin:tp2 .
- **push a Docker Hub:** docker push margarita0912/hola-gin:tp2

# 4. Creacion de db

## 1. Crear el esquema y la db
- para ello elegimos mysql, ya que estamos acostumbradas a su uso.
- cree una tabla users, con 3 columnas: id, username y password

## 2. Conecte mysql con la app
dbUser := getEnv("DB_USER", "root")
dbPassword := getEnv("DB_PASSWORD", "margoch")
dbHost := getEnv("DB_HOST", "localhost")
dbPort := getEnv("DB_PORT", "3306")
dbName := getEnv("DB_NAME", "db")

dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName

## 3. Cree un endpoint para listar los usuarios y otro para crear usuarios
- los probe en postman, se ejecuaron correctamente.

## 4. Ejecute la app con docker
- puse a prueba los endpoints desde el localhost, anduvieron correctamente.


# 5. QA y PROD

## 1. Variables Definidas
- **Valores**: QA 8081, PROD 8082
- **Justificación**: Permite al código adaptar su comportamiento según el entorno
## 2. Aplicación: 
  - Modo de ejecución de Gin (Debug/Release)
  - Controlar el nivel de detalle de los logs
  - **Valores**: DEBUG, INFO, WARN, ERROR
  - **Justificación**: 
  - QA: DEBUG para troubleshooting durante desarrollo
  - PROD: INFO para reducir ruido en producción
  - **Bases de datos**: 
  - Bases de datos separadas para cada entorno
  - Credenciales diferentes por seguridad
  - Hosts diferentes (contenedores separados)

# 6. Docker-compose.yml

## 1. Bases de Datos MySQL
**mysql-qa & mysql-prod:**
- Bases de datos separadas con volúmenes persistentes
- Healthchecks para verificar conectividad
- Puertos mapeados diferentes (3307 para QA, 3308 para PROD)

## 2. Aplicaciones Backend
**app-qa & app-prod:**
- Misma imagen: margarita0912/hola-gin:tp2
- Configuraciones diferentes mediante variables de entorno
- Redes aisladas por entorno
- Dependencias controladas con healthchecks

## 3. Frontend
- Servicio adicional para interfaz web
- Conectado a ambas redes (qa y prod)
- Puerto 5173 expuesto

## 4. Entorno ejecutable en cualquier máquina

### 1. Usar Nombres de Servicio DNS Internos
- CORRECTO
DB_HOST: mysql-qa
DB_HOST: mysql-prod

- INCORRECTO - No portable
DB_HOST: localhost
DB_HOST: 127.0.0.1
DB_HOST: host.docker.internal

### 2. Healthchecks para Dependencias Robustas
- aseguran que los servicios estén realmente disponibles antes de que las dependencias inicien, evitando problemas de race conditions en cualquier máquina.

### 3. Mapeo de Puertos No Conflictivos
- ports:
    - "3307:3306"  # MySQL QA
    - "3308:3306"  # MySQL PROD  
    - "8081:8081"  # App QA
    - "8082:8081"  # App PROD
- Puertos únicos evitan conflictos con servicios locales en cualquier máquina.

### 4. Redes Aisladas por Entorno
- networks:
    qa: {}
    prod: {}
- Las redes definidas en el compose crean namespaces aislados que funcionan consistentemente.

### 5. Versiones Específicas de Imágenes
- Versión específica:
    - image: mysql:8.4  
- Version no especificada, puede cambiar
   - image: mysql:

# 7. Tag modificada a v1.0

## 1. Se modifico el tag de tp2 a v1.0 en
- Las imagenes de QA y PROD del archivo docker-compose.yml

## 2. Se pusheo la imagen con el nuevo tag a docker hub
- docker login
- docker build -t margarita0912/hola-gin:v1.0 .
- docker push margarita0912/hola-gin:v1.0

## 3. Convención de Versionado Elegida
**Semantic Versioning (SemVer)**
- Se utilizo SemVer v1.0.0 con el formato: vX.Y.Z
    - X (Major): Cambios incompatibles (v1 → v2)
    - Y (Minor): Nuevas funcionalidades compatibles (v1.0 → v1.1)
    - Z (Patch): Correcciones de bugs (v1.0.0 → v1.0.1)
- **v1.0.0** indica la primera versión estable

