// using export default Imports this js class into script.js
export default class BudgetTracker {
  // The constructor takes in the query selector string.
  constructor(querySelectorString) {
    // This.root will pass the query selector string to the console.
    this.root = document.querySelector(querySelectorString);
    // Takes the inner.HTML from the static HTML below which holds our html content and will pass it to the web app/ UI.
    this.root.innerHTML = BudgetTracker.html();
    // This makes it so that when the user clicks on the entry button on the app it'll run the function below and make a call to this.onNewEntryBtnClick();. This will pull the static entryHtml content from below and paste it on the app as another row.
    this.root.querySelector(".new-entry").addEventListener("click", () => {
      this.onNewEntryBtnClick();
    });
    //Loads initial data from local storage
    this.load();
  }
  // returns the html for the table itself
  static html() {
    return `
       <table class="budget-tracker">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody class="entries">
        </tbody>
        <tbody>
            <tr>
                <td colspan="5" class="controls">
                    <button type="button" class="new-entry">New Entry</button>
                </td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" class="summary">
                    <strong>Total:</strong>
                    <span class="total">$0.00</span>
                </td>
            </tr>
        </tfoot>
      </table>
    `;
  }
  // returns the html string for a single row inside of the table
  static entryHtml() {
    return `
        <tr>
            <td>
              <input class="input input-date" type="date" /></td>
                    <td>
                      <input
                        class="input input-description"
                        type="text"
                        placeholder="What will you track?"
                      />
                    </td>
                 
                    <td>
                      <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </td>
                      <td class="input input-type">
                        <input type="number" class="input input-amount" />
                      </td>
                      <td class="input input-type">
                        <button type="button" class="delete-entry"><i class="fa-solid fa-trash"></i></button>
                      </td>
                    </td>
                  </tr>
                  `;
  }
  // this is the enitial loading of the data
  load() {
    const entries = JSON.parse(
      localStorage.getItem("budget-tracker-entries-dev") || "[]"
    );

    for (const entry of entries) {
      this.addEntry(entry);
    }

    this.updateSummary();
  }
  // Takes all of the curent rows in the table and works out the total ammount to display it in the bottom right corner.

  updateSummary() {
    // this.getEntryRows gives us access to the array reduce method.
    // the reduce method allows me to take an array and reduce it down to a single value.
    // In this case it will take every single row and convert it into a single value.
    // (total, row) is a call back function that takes what ever row that i'm currently on as I loop through each row.
    const total = this.getEntryRows().reduce((total, row) => {
      // Grabs the amount out of the input field. by selecting the input class and using the .value property to get that value.
      const amount = row.querySelector(".input-amount").value;
      // This grabs the value out of the input class and uses the .value property to determine if the value is an expense or not.
      const isExpense = row.querySelector(".input-type").value === "expense";
      // This will be applied to our math to determine if the value is an expense. If so then the value will be negative making it an expense. Otherwise it woukld be positive making it not an expense.
      const modifier = isExpense ? -1 : 1;
      // This returns our total amount plus the positive amount that we interred. If the modifer is set to expense then the number will be negative and take money away from our total amount.
      return total + amount * modifier;
    }, 0);

    // This total format variable will format the currency that's displayed on the page to look like US currnecy by using the (new) keyword to create a new object. Intl.NumberFormat is a constructor that enables sensitive number formasting. which is what we need in order to establish US currency formatting to our web app.
    const totalFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      // .format(total) is formatting our total on the web app page to the desired currency that we want.
    }).format(total);

    // the .total refers to the span element class in our html and on the web app.
    this.root.querySelector(".total").textContent = totalFormatted;
  }
  // Takes all of the data and saves it in local storage so that it will remain there once the user reloads the page.
  save() {
    // The array below when we use .map allows us to take each one of our entry rows and convert them into somethinhg else.
    const data = this.getEntryRows().map((row) => {
      return {
        // The objects below are what are gettimg saved in local storage in the dev tools.
        date: row.querySelector(".input-date").value,
        description: row.querySelector(".input-description").value,
        type: row.querySelector(".input-type").value,
        // I used the Function parseFloat below to take out our value and convert it into a float number to be displayed with decimals on the page.
        amount: parseFloat(row.querySelector(".input-amount").value),
      };
    });

    // The line below will convert the array of data into a json string with the JSON.stringify() function
    localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    this.updateSummary();
  }
  // Takes in an entry as an Object.
  addEntry(entry = {}) {
    // I'm selecting the .entries class in the container for the entries. That is what I'm selectinmg when I call .entries with my query selector.
    this.root
      .querySelector(".entries")
      // "beforeend", BudgetTracker.entryHtml will inject this html before the end of my table body.
      .insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

    // This row references the html above in order to inject itself into the table row in the html.
    // last-of-type is refence to the line above
    const row = this.root.querySelector(".entries tr:last-of-type");

    // This gives us access to the date picker input field in the html using the input date class. Then I set the value to entry.date which could either be a new date that the user enters or if the date is left empty it will default to the current date by using new Date().toISOSring().replace(/T.*/,"");
    //  broken down this means: new Date().toISOSring().replace(/T.*/,"");
    // new Date().toISOSring() will convert a Date object into a string, using the ISO 8601 standard. The ISO 8601 standard is a date structure that looks like YYYY-MM-DDTHH:mm:ss.sssZ. This will give us the correct date format in the dev tools application storage menu.
    // .replace(/T.*/,""); is a regex that will replace T and everying in front of it with an empty string so that we only get the date when it prints to the console and none of the other stuff that follows.
    row.querySelector(".input-date").value =
      entry.date || new Date().toISOString().replace(/T.*/, "");
    // This will be set to an empty string unless the user enters content into it.
    row.querySelector(".input-description").value = entry.description || "";
    // This will make it so that the type will be entry and default to income whenever a new row is generated after pressing the new entry button on the web app. The user could click on this entry and select expense instead of income if they'd like the opposite.
    row.querySelector(".input-type").value = entry.type || "income";
    // This input will be genrated to automatically display zero for the amount unless the user inputs there own desired number.
    row.querySelector(".input-amount").value = entry.amount || 0;
    // This has an eventListener which listens for a click on the .delete-entry button class. Once the click is heard this function will activate and delete the previously created entry.
    row.querySelector(".delete-entry").addEventListener("click", (e) => {
      this.onDeleteEntryBtnClick(e);
    });

    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.save());
    });
  }
  // This helps us return all of the rows inside of the tables/entrys
  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".entries tr"));
  }
  // when you click on the button for a new entry this functin will run and add that new entry.
  onNewEntryBtnClick() {
    this.addEntry();
  }
  // This runs a function to delete the entry that the user created after you click on the delete button in the web page.
  // e is short for event. It holds details like the type of event such as click, keypress, etc..
  // e.target: The DOM element that triggered the event.
  //  e.type: The type of event (e.g., 'click', 'keydown', 'mousemove').
  //  e.clientX, e.clientY: The mouse coordinates for mouse events.
  //  e.keyCode: The key code for keyboard events.
  //  e.preventDefault(): A method to prevent the default behavior of the event (e.g., preventing a link from navigating).
  //  In this instance e.target is targeting the tr element and removing it from the web page once you click the delete button.
  onDeleteEntryBtnClick(e) {
    e.target.closest("tr").remove();
    // the this.save() keyword is saving that change so that when the page reloads the change has still occured.
    this.save();
  }
}
