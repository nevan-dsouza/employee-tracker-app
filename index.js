// Assigning dependancies 
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    // Insert your password here. It may be different depending on your MySQL credentials.
    password: 'adminroot',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

// Title screen and first prompt
console.log(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

███████ ███    ███ ██████  ██       ██████  ██    ██ ███████ ███████       ████████ ██████   █████   ██████ ██   ██ ███████ ██████  
██      ████  ████ ██   ██ ██      ██    ██  ██  ██  ██      ██               ██    ██   ██ ██   ██ ██      ██  ██  ██      ██   ██ 
█████   ██ ████ ██ ██████  ██      ██    ██   ████   █████   █████   █████    ██    ██████  ███████ ██      █████   █████   ██████  
██      ██  ██  ██ ██      ██      ██    ██    ██    ██      ██               ██    ██   ██ ██   ██ ██      ██  ██  ██      ██   ██ 
███████ ██      ██ ██      ███████  ██████     ██    ███████ ███████          ██    ██   ██ ██   ██  ██████ ██   ██ ███████ ██   ██ 
                                                                                                                                    
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

let initPrompt = () => {
    inquirer.prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee's Role",
          "Update an Employee's Manager",
          "View Employees By Manager",
          "View Employees By Department",
          "Delete a Department",
          "Delete a Role",
          "Delete an Employee",
          "View Total Utilized Budget for a Department",
          "Exit"
        ],
      },
    ])
      // Switch statement to call a function depending on what the user chooses
      .then((answer) => {
        switch (answer.action) {
          case "View All Departments":
            viewAllDepartments();
            break;
          case "View All Roles":
            viewAllRoles();
            break;
          case "View All Employees":
            viewAllEmployees();
            break;
          case "Add a Department":
            addDepartment();
            break;
          case "Add a Role":
            addRole();
            break;
          case "Add an Employee":
            addEmployee();
            break;
          case "Update an Employee's Role":
            updateEmployeeRole();
            break;
          case "Update an Employee's Manager":
            updateEmployeeManager();
            break;
          case "View Employees By Manager":
            viewEmployeesByManager();
            break;
          case "View Employees By Department":
            viewEmployeesByDepartment();
            break;
          case "Delete a Department":
            deleteDepartment();
            break;
          case "Delete a Role":
            deleteRole();
            break;
          case "Delete an Employee":
            deleteEmployee();
            break;
          case "View Total Utilized Budget for a Department":
            viewTotalBudget();
            break;
          // If the user wishes to exit the application
          case "Exit":
            console.log("Goodbye!");
            db.end();
            break;
        }
      });
  }
  
  // Function for viewing a formatted table showing department names and department ids
  let viewAllDepartments = () => {
    db.query(`SELECT department.name AS "Department", department.id AS "Department Id" FROM department;`, (err, result) => {
      if (err) throw err;
      console.table(result);
      initPrompt();
    });
  }
  
  // Function for viewing a table showing roles with job title, role id, the department that role belongs to, and the salary for that role
  let viewAllRoles = () => {
    db.query(`SELECT role.title AS "Role", role.id AS "Role Id", 
    department.name AS "Department", role.salary AS "Salary ($)" 
    FROM role JOIN department ON role.department_id = department.id;`, (err, result) => {
      if (err) throw err;
      console.table(result);
      initPrompt();
    });
  }
  
  // Function for viewing a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
  let viewAllEmployees = () => {
    db.query(`SELECT e.first_name AS "First Name", e.last_name AS "Last Name", 
    r.title AS "Job Title", d.name AS "Department", r.salary AS "Salary ($)",
    CONCAT(m.first_name, " ", m.last_name) AS "Manager" 
    FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id 
    LEFT JOIN department AS d ON r.department_id = d.id 
    LEFT JOIN employee AS m ON e.manager_id = m.id;`, (err, result) => {
      if (err) throw err;
      console.table(result);
      initPrompt();
    });
  }
  
  // Function for adding a new department to the department table
  let addDepartment = () => {
    inquirer.prompt([
      {
        type: "input",
        message: "Which department would you like to add?",
        name: "newDepartment"
      },
    ])
      .then((answer) => {
        db.query(`INSERT INTO department SET ?`,
          {
            name: answer.newDepartment
          },
          (err, result) => {
            if (err) throw err;
            console.log("Your department has been added!");
            initPrompt();
          });
      });
  }
  
  // Function for adding a new role to the role table
  let addRole = () => {
    // First we make a query statement to retrieve table of all departments
    db.query('SELECT * FROM department', (err, result) => {
      if (err) throw err;
  
      let departmentChoices = []
  
      // For department, we should be able to retrieve both the name and the id of the department
      result.forEach(department => {
        departmentChoices.push({
          name: department.name,
          value: department.id
        });
      });
  
      // Prompting questions
      inquirer.prompt([
        {
          type: "input",
          message: "What is the name of the role?",
          name: "newRole"
        },
        {
          type: "input",
          message: "What is the annual salary of the role, in dollars? Enter a number:",
          name: "newSalary"
        },
        {
          type: "list",
          message: "Which department does the role belong to?",
          name: "department",
          choices: departmentChoices
        },
      ])
        .then((answer) => {
          // Finally, make a query statement that inserts new role into table using name of new role and department id
          db.query(`INSERT INTO role (title, salary, department_id) VALUES (?)`, [[answer.newRole, answer.newSalary, answer.department]], (err, result) => {
            if (err) throw err;
            console.log(`Your new role, ${answer.newRole} has been added!`);
            initPrompt();
          });
        });
    });
  }
  
  // Function for adding a new employee to the employee table
  let addEmployee = () => {
    // Before we prompt, we retrieve all the current employees to generate an array of managers
    db.query("SELECT * FROM employee WHERE manager_id IS NULL", (err, result) => {
      if (err) throw err;
  
      let managerChoices = [
        {
          // This is a choice the user can choose if the role doesn't have a manager
          name: 'None',
          value: 0
        }
      ];
  
      // Create an array for managers
      result.forEach(({ first_name, last_name, id }) => {
        managerChoices.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
  
      // Query table for roles
      db.query("SELECT * FROM role", (err, result) => {
        if (err) throw err;
  
        // Create an array for roles
        let roleChoices = [];
        result.forEach(({ title, id }) => {
          roleChoices.push({
            name: title,
            value: id
          });
        });
  
        inquirer.prompt([
          {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"
          },
          {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
          },
          {
            type: "list",
            name: "roleId",
            message: "What is the employee's role?",
            choices: roleChoices
  
          },
          {
            type: "list",
            name: "managerName",
            choices: managerChoices,
            message: "Who is the employee's manager?"
          }
        ])
          .then((answer) => {
            // If user picked "None", the value for that is 0, so that would set the employee's manager name to null
            let managerId = answer.managerName !== 0 ? answer.managerName : null;
  
            // Finally make a query statement to insert new row into employee table
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`, [[answer.firstName, answer.lastName, answer.roleId, managerId]], (err, result) => {
              if (err) throw err;
              console.log(`Added ${answer.firstName} ${answer.lastName} to the database`);
              initPrompt();
            });
          });
      });
    });
  }
  
  // Function for updating an already established employee
  let updateEmployeeRole = () => {
    // First we make an SQL query to retrieve employee table
    db.query(`SELECT * FROM employee`, (err, result) => {
      if (err) throw err;
  
      // Then we create an array of employee objects
      let employeeChoices = [];
  
      result.forEach(({ first_name, last_name, id }) => {
        employeeChoices.push({
          name: `${first_name} ${last_name}`,
          value: id
        });
      });
  
      // After that, we make another SQL query but for the roles
      db.query("SELECT * FROM role", (err, result) => {
        if (err) throw err;
  
        // Same as employees, this time making an array of objects for roles
        let roleChoices = [];
  
        result.forEach(({ title, id }) => {
          roleChoices.push({
            name: title,
            value: id
          });
        });
  
        // Prompt questions
        inquirer.prompt([
          {
            type: "list",
            name: "employeeName",
            message: "Which employee's role would you like to update?",
            choices: employeeChoices
          },
          {
            type: "list",
            name: "updatedRole",
            message: "What is the employee's new role?",
            choices: roleChoices
          }
        ])
          // Lastly execute the query that updates role id of the employee depending on the responses the user gave
          .then((answer) => {
            db.query(`UPDATE employee SET ? WHERE ?? = ?;`, [{ role_id: answer.updatedRole }, "id", answer.employeeName], (err, result) => {
              if (err) throw err;
              console.log(`Successfully updated the employee's role!`);
              initPrompt();
            });
          });
      });
    });
  }
  
  // Bonus Functions. These functions use the same coding pattern of previous ones, where a SELECT * FROM statement is used to retrieve a table, then another query is called with the statement used to view/update/delete rows
  
  let updateEmployeeManager = () => {
    db.query("SELECT * FROM employee", (err, result) => {
      if (err) throw err;
  
      let employeeChoices = [];
  
      result.forEach(({ first_name, last_name, id }) => {
        employeeChoices.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
  
      let managerChoices = [{
        name: 'None',
        value: 0
      }];
  
      result.forEach(({ first_name, last_name, id }) => {
        managerChoices.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Select employee whose manager you wish to change:",
          name: "employeeId",
          choices: employeeChoices
        },
        {
          type: "list",
          message: "Who is the employee's new manager?",
          name: "managerId",
          choices: managerChoices
        }
      ])
        .then((answer) => {
  
          let manager_id = answer.managerId !== 0 ? answer.managerId : null;
  
          db.query(`UPDATE employee SET ? WHERE id = ?;`, [{ manager_id: manager_id }, answer.employeeId], (err, result) => {
            if (err) throw err;
            console.log("The employee now has a new manager!");
            initPrompt();
          });
        });
    });
  }
  
  let viewEmployeesByManager = () => {
    db.query("SELECT * FROM employee", (err, result) => {
      if (err) throw err;
  
      let managerChoices = [{
        name: 'None',
        value: 0
      }];
  
      result.forEach(({ first_name, last_name, id }) => {
        managerChoices.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Which manager's employees would you like to view?",
          name: "managerId",
          choices: managerChoices
        }
      ])
        .then((answer) => {
  
          let manager_id = answer.managerId !== 0 ? answer.managerId : null;
          let whereStatement = answer.manager_id !== 0 ? "= ?" : "IS NULL";
  
          db.query(`SELECT e.first_name AS "First Name", e.last_name AS "Last Name", 
            r.title AS "Job Title", d.name AS "Department", r.salary AS "Salary ($)",
            CONCAT(m.first_name, " ", m.last_name) AS "Manager" 
            FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id 
            LEFT JOIN department AS d ON r.department_id = d.id 
            LEFT JOIN employee AS m ON e.manager_id = m.id 
            WHERE e.manager_id ${whereStatement};`, [answer.managerId], (err, result) => {
            if (err) throw err;
            console.table(result);
            initPrompt();
          });
        });
    });
  }
  
  let viewEmployeesByDepartment = () => {
    db.query('SELECT * FROM department', (err, result) => {
      if (err) throw err;
  
      let departmentChoices = []
  
      result.forEach(department => {
        departmentChoices.push({
          name: department.name,
          value: department.id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Which department's employees would you like to view?",
          name: "departmentId",
          choices: departmentChoices
        },
      ])
        .then((answer) => {
          db.query(`SELECT e.first_name AS "First Name", e.last_name AS "Last Name", 
          r.title AS "Job Title", d.name AS "Department", r.salary AS "Salary ($)",
          CONCAT(m.first_name, " ", m.last_name) AS "Manager" 
          FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id 
          LEFT JOIN department AS d ON r.department_id = d.id 
          LEFT JOIN employee AS m ON e.manager_id = m.id 
          WHERE d.id = ?;`, [answer.departmentId], (err, result) => {
            if (err) throw err;
            console.table(result);
            initPrompt();
          });
        });
    });
  }
  
  let deleteDepartment = () => {
    db.query('SELECT * FROM department', (err, result) => {
      if (err) throw err;
  
      let departmentChoices = []
  
      result.forEach(department => {
        departmentChoices.push({
          name: department.name,
          value: department.id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Which department do you want to delete?",
          name: "departmentId",
          choices: departmentChoices
        },
      ])
        .then((answer) => {
          db.query(`DELETE FROM department WHERE id = ?;`, [answer.departmentId], (err, result) => {
            if (err) throw err;
            console.log(`The department has been successfully deleted.`);
            initPrompt();
          });
        });
    });
  }
  
  let deleteRole = () => {
    db.query("SELECT * FROM role", (err, result) => {
      if (err) throw err;
  
      let roleChoices = [];
      result.forEach(({ title, id }) => {
        roleChoices.push({
          name: title,
          value: id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          name: "roleId",
          message: "Which role would you like to delete?",
          choices: roleChoices
        }
      ])
        .then((answer) => {
          db.query(`DELETE FROM role WHERE id = ?`, [answer.roleId], (err, response) => {
            if (err) throw err;
            console.log(`The role has been successfully deleted.`);
            initPrompt();
          });
        });
    });
  }
  
  let deleteEmployee = () => {
    db.query("SELECT * FROM employee", (err, result) => {
      if (err) throw err;
  
      let employeeChoices = [];
  
      result.forEach(({ first_name, last_name, id }) => {
        employeeChoices.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Which employee would you like to delete?",
          name: "employeeId",
          choices: employeeChoices
        }
      ])
        .then((answer) => {
          db.query(`DELETE FROM employee WHERE id = ?;`, [answer.employeeId], (err, res) => {
            if (err) throw err;
            console.log("The employee has been deleted!");
            initPrompt();
          });
        });
    });
  }
  
  let viewTotalBudget = () => {
    db.query('SELECT * FROM department', (err, result) => {
      if (err) throw err;
  
      let departmentChoices = []
  
      result.forEach(department => {
        departmentChoices.push({
          name: department.name,
          value: department.id
        });
      });
  
      inquirer.prompt([
        {
          type: "list",
          message: "Which department's budget do you want to view?",
          name: "departmentId",
          choices: departmentChoices
        },
      ])
        .then((answer) => {
          db.query(`SELECT d.name AS "Department", SUM(salary) AS "Total Utilized Budget ($)" 
          FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id 
          LEFT JOIN department AS d ON r.department_id = d.id WHERE d.id = ?`, [answer.departmentId], (err, result) => {
            if (err) throw err;
            console.table(result);
            initPrompt();
          });
        });
    });
  }
  
  // Start program:
  initPrompt();