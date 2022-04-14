
SE project

This project contains two major things : Task Schedular and Personal Space . Both of these are password protected and the authentication has been done using passport ,which is a  nodeJS module . 
We have made use of EJS templates as they allow a very easy integration of Javascript in HTML files so fetching the data from database and viewing it in the HTML webapges is much easier .


To add reminders or task into the task schedular , simple type the task into the writing area and press the "+" icon , your task will be added . To remove the task , simple click the checkbox next to the task you want to remove and it will  be deleted

To add your entries into your personal space , click on "Add" in the navigation bar and your entry a title and list the content . Then click on publish and your journal will be updated . 

To run this code locally , you will need to setup a mongoDB server locally (https://stackoverflow.com/questions/20796714/how-do-i-start-mongo-db-from-windows)  and then run the app.js file in the terminal . By defaut , this site will be hosted on "http://localhost:3000/" .
