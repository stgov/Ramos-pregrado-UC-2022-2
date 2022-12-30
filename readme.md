# Visualización ramos de pregrado UC 2022-2

Esta visualización es una vista general de los ramos de pregrado de la uc para el segundo semestre del año 2022.

Los datos los extraje del el catalogo uc mediante web scrapping, luego los procese en pandas para obtener el nivel y grado, en caso de ser equivalentes
los trate como el mismo ramo, el grado representa que cuantos ramos necesitan directamente el ramo como prerequisito y el nivel es el el nivel máximo de 
los prerequisitos del ramo (0 si no hay prerequisitos, recursivo con un máximo de 5).

La visualización la hice con la librería d3 de javascript, la parte de scrapping con python y las librerías beautifulsoup, scrappy, requests y regex.

En la visualización cada nodo representa un ramo, el tamaño indica el grado, la zona en que se ubica indica el nivel y su color indica la escuela a que pertenece,
a la izquierda el gráfico indica la cantidad de ramos por escuela y su respectivo color esta abajo, si se clickea en un ramo se pueden ver los detalles.