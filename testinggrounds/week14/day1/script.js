/* ============================================
   GLOBAL STATE VARIABLES
   ============================================ */

// holds the current database instance from sql.js
let db = null;

// stores the column names from the imported csv
let columns = [];

// stores all the data rows from the csv
let dataRows = [];


/* ============================================
   INITIALIZATION
   ============================================ */

// wait for dom to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', initializeApp);


// main initialization function - sets up sql.js and event listeners
async function initializeApp() {
    try {
        // initialize sql.js wasm module
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // create new database instance in memory
        db = new SQL.Database();
        
        console.log('database initialized successfully');
        
    } catch (error) {
        console.error('failed to initialize database:', error);
        alert('error initializing database. please refresh the page.');
    }
    
    // set up all event listeners for user interactions
    setupEventListeners();
}


// attach event listeners to all interactive elements
function setupEventListeners() {
    // file import handler
    document.getElementById('file-input').addEventListener('change', handleFileImport);
    
    // export button handler
    document.getElementById('export-btn').addEventListener('click', handleExport);
    
    // run query button handler
    document.getElementById('run-query-btn').addEventListener('click', handleRunQuery);
    
    // add row form submission handler
    document.getElementById('add-row-form').addEventListener('submit', handleAddRow);
}


/* ============================================
   FILE IMPORT FUNCTIONALITY
   ============================================ */

// handles csv file import when user selects a file
async function handleFileImport(event) {
    const file = event.target.files[0];
    
    // exit if no file was selected
    if (!file) return;
    
    try {
        // read file contents as text
        const text = await file.text();
        
        // parse csv text into structured data
        const parsedData = parseCSV(text);
        
        // store parsed data in global state
        columns = parsedData.columns;
        dataRows = parsedData.rows;
        
        // create database table with the imported data
        createTable();
        
        // generate form fields for adding new rows
        generateFormFields();
        
        // generate example sql queries based on columns
        generateExampleQueries();
        
        // enable buttons that were disabled
        document.getElementById('export-btn').disabled = false;
        document.getElementById('run-query-btn').disabled = false;
        document.getElementById('add-row-btn').disabled = false;
        
        console.log('file imported successfully');
        
    } catch (error) {
        console.error('error importing file:', error);
        alert('error importing csv file. please check the file format.');
    }
}


// parses csv text into columns and rows
function parseCSV(text) {
    // split text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // exit if file is empty
    if (lines.length === 0) {
        throw new Error('csv file is empty');
    }
    
    // first line contains column headers
    const headers = parseCSVLine(lines[0]);
    
    // remaining lines are data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        // only add rows that have the correct number of columns
        if (values.length === headers.length) {
            rows.push(values);
        }
    }
    
    return { columns: headers, rows: rows };
}


// parses a single csv line, handling quotes and commas properly
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            // handle escaped quotes (two quotes in a row)
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // skip next quote
            } else {
                // toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // found a field separator
            result.push(current.trim());
            current = '';
        } else {
            // regular character
            current += char;
        }
    }
    
    // add the last field
    result.push(current.trim());
    
    return result;
}


/* ============================================
   DATABASE TABLE MANAGEMENT
   ============================================ */

// creates a new table in the database with imported data
function createTable() {
    try {
        // drop existing table if it exists
        db.run('DROP TABLE IF EXISTS data');
        
        // create column definitions (all as text type for simplicity)
        const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ');
        
        // create new table
        db.run(`CREATE TABLE data (${columnDefs})`);
        
        // insert all data rows into the table
        const placeholders = columns.map(() => '?').join(', ');
        const insertStmt = db.prepare(`INSERT INTO data VALUES (${placeholders})`);
        
        dataRows.forEach(row => {
            insertStmt.run(row);
        });
        
        insertStmt.free();
        
        console.log('table created with', dataRows.length, 'rows');
        
    } catch (error) {
        console.error('error creating table:', error);
    }
}


/* ============================================
   SQL QUERY EXECUTION
   ============================================ */

// handles running sql queries entered by user
function handleRunQuery() {
    const query = document.getElementById('query-input').value.trim();
    
    // check if query is empty
    if (!query) {
        alert('please enter a sql query');
        return;
    }
    
    try {
        // execute the query
        const results = db.exec(query);
        
        // display results
        displayQueryResults(results);
        
    } catch (error) {
        console.error('query error:', error);
        document.getElementById('query-results').innerHTML = 
            `<p class="data-placeholder" style="color: #e53e3e;">error: ${escapeHtml(error.message)}</p>`;
    }
}


// displays results from sql query execution
function displayQueryResults(results) {
    const resultsElement = document.getElementById('query-results');
    
    // check if query returned no results
    if (!results || results.length === 0) {
        resultsElement.innerHTML = '<p class="data-placeholder">query executed successfully. no results returned.</p>';
        return;
    }
    
    // get first result set
    const result = results[0];
    const resultColumns = result.columns;
    const resultValues = result.values;
    
    // build results table
    let html = '<table><thead><tr>';
    
    resultColumns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    resultValues.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${escapeHtml(String(cell))}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    resultsElement.innerHTML = html;
}


// escapes html special characters to prevent xss
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


/* ============================================
   EXAMPLE QUERIES GENERATION
   ============================================ */

// generates example sql queries based on imported columns
function generateExampleQueries() {
    const examplesContainer = document.getElementById('example-queries');
    
    // exit if no columns available
    if (columns.length === 0) {
        examplesContainer.innerHTML = '';
        return;
    }
    
    const examples = [];
    
    // example 1: select all records
    examples.push('SELECT * FROM data');
    
    // example 2: select first column only
    examples.push(`SELECT "${columns[0]}" FROM data`);
    
    // example 3: count total rows
    examples.push('SELECT COUNT(*) as total_rows FROM data');
    
    // example 4: limit results to 5 rows
    examples.push('SELECT * FROM data LIMIT 5');
    
    // example 5: complex query with multiple operations
    if (columns.length >= 2) {
        examples.push(`SELECT "${columns[0]}", COUNT(*) as count FROM data GROUP BY "${columns[0]}" ORDER BY count DESC`);
    }
    
    // create clickable example buttons
    let html = '';
    examples.forEach(query => {
        html += `<div class="example-query" data-query="${escapeHtml(query)}">${escapeHtml(query)}</div>`;
    });
    
    examplesContainer.innerHTML = html;
    
    // add click handlers to populate query input
    examplesContainer.querySelectorAll('.example-query').forEach(element => {
        element.addEventListener('click', () => {
            document.getElementById('query-input').value = element.getAttribute('data-query');
        });
    });
}


/* ============================================
   ADD NEW ROW FUNCTIONALITY
   ============================================ */

// generates input fields for each column to add new rows
function generateFormFields() {
    const formFieldsContainer = document.getElementById('form-fields');
    
    // exit if no columns available
    if (columns.length === 0) {
        formFieldsContainer.innerHTML = '<p class="data-placeholder">no columns available.</p>';
        return;
    }
    
    // create input field for each column
    let html = '';
    columns.forEach((col, index) => {
        html += `
            <div class="form-field">
                <label for="field-${index}">${escapeHtml(col)}</label>
                <input 
                    type="text" 
                    id="field-${index}" 
                    name="${escapeHtml(col)}" 
                    placeholder="enter ${escapeHtml(col)}"
                    required
                >
            </div>
        `;
    });
    
    formFieldsContainer.innerHTML = html;
}


// handles form submission to add a new row
function handleAddRow(event) {
    // prevent default form submission behavior
    event.preventDefault();
    
    // collect values from all form fields
    const newRow = [];
    columns.forEach((col, index) => {
        const value = document.getElementById(`field-${index}`).value.trim();
        newRow.push(value);
    });
    
    try {
        // insert new row into database
        const placeholders = columns.map(() => '?').join(', ');
        db.run(`INSERT INTO data VALUES (${placeholders})`, newRow);
        
        // add to in-memory data array
        dataRows.push(newRow);
        
        // clear form fields
        event.target.reset();
        
        console.log('new row added successfully');
        
    } catch (error) {
        console.error('error adding row:', error);
        alert('error adding row to database.');
    }
}


/* ============================================
   EXPORT FUNCTIONALITY
   ============================================ */

// handles exporting current data as csv file
function handleExport() {
    try {
        // query all data from database
        const results = db.exec('SELECT * FROM data');
        
        // check if there's data to export
        if (!results || results.length === 0 || dataRows.length === 0) {
            alert('no data to export');
            return;
        }
        
        // build csv content
        let csv = columns.join(',') + '\n';
        
        // get fresh data from database to include any new rows
        const freshResults = db.exec('SELECT * FROM data')[0];
        freshResults.values.forEach(row => {
            csv += row.join(',') + '\n';
        });
        
        // create blob and download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exported_data.csv';
        
        // trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // clean up url object
        window.URL.revokeObjectURL(url);
        
        console.log('data exported successfully');
        
    } catch (error) {
        console.error('error exporting data:', error);
        alert('error exporting data.');
    }
}