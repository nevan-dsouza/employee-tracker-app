INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ("Sales Person", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 160000, 3),
       ("Accountant", 125000, 3),
       ("Legal Team Lead", 250000, 4),
       ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, manager_id, role_id)
VALUES ("Jane", "Bradley", NULL, 1),
       ("Paris", "Holton", 1, 2),
       ("Alden", "Prince", NULL, 3),
       ("Mahmoud", "Ibrahim", 3, 4),
       ("Tarik", "Ahmed", NULL, 5),
       ("Rengoku", "Hashira", 5, 6),
       ("Phoenix", "Valo", NULL, 7),
       ("Austin", "Jeffrey", 7, 8);