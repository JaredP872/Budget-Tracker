// using export default Imports this class into script.js
export default class BudgetTracker {
  // Takes in the query selector string
  constructor(querySelectorString) {
    // add note
    this.root = document.querySelector(querySelectorString);
    // add note
    this.root.innerHTML = BudgetTracker.html();
    // add note
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
  // This takes all of the curent rows in the table and works out  the total ammount to display it in the bottom right corner.
  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector(".input-amount").value;
      const isExpense = row.querySelector(".input-type").value === "expense";
      const modifier = isExpense ? -1 : 1;

      return total + amount * modifier;
    }, 0);

    const totalFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(total);

    this.root.querySelector(".total").textContent = totalFormatted;
  }
  // This takes all of the data and saves it in local storage so that it will remain there once you reload your page once you.
  save() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector(".input-date").value,
        description: row.querySelector(".input-description").value,
        type: row.querySelector(".input-type").value,
        amount: parseFloat(row.querySelector(".input-amount").value),
      };
    });

    localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    this.updateSummary();
  }
  // This takes in an entry as an Object.
  addEntry(entry = {}) {
    this.root
      .querySelector(".entries")
      .insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

    const row = this.root.querySelector(".entries tr:last-of-type");

    row.querySelector(".input-date").value =
      entry.date || new Date().toISOString().replace(/T.*/, "");
    row.querySelector(".input-description").value = entry.description || "";
    row.querySelector(".input-type").value = entry.type || "income";
    row.querySelector(".input-amount").value = entry.amount || 0;
    row.querySelector(".delete-entry").addEventListener("click", (e) => {
      this.onDeleteEntryBtnClick(e);
    });

    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.save());
    });
  }
  // This helps us return all of the rows inside of the tables/ entrys
  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".entries tr"));
  }
  // when you clikc on the button for a new entry this functin will run and add that new entry.
  onNewEntryBtnClick() {
    this.addEntry();
  }
  // This runs a function to delete the entry that you created after you click on the delete button in the UI
  onDeleteEntryBtnClick(e) {
    e.target.closest("tr").remove();
    this.save();
  }
}
