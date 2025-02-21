
<h1>Author Collaboration Network Analyzer</h1>
<p>This project is a web-based tool for analyzing and visualizing author collaboration networks. It allows users to
    explore relationships between authors, find the shortest path between two authors, create collaboration queues,
    and visualize the network using interactive graphs.</p>
<h2>Features</h2>
<ul>
    <li>
        <p><strong>Interactive Network Graph</strong>: Visualize author collaborations with an interactive graph.
        </p>
    </li>
    <li>
        <p><strong>Shortest Path Finder</strong>: Find the shortest path between two authors based on their
            collaborations.</p>
    </li>
    <li>
        <p><strong>Collaboration Queue</strong>: Generate a queue of authors based on their collaboration counts.
        </p>
    </li>
    <li>
        <p><strong>Binary Search Tree Visualization</strong>: Create and visualize a binary search tree from the
            collaboration data.</p>
    </li>
    <li>
        <p><strong>Longest Path Finder</strong>: Find the longest path in the collaboration network for a given
            author.</p>
    </li>
    <li>
        <p><strong>Count Collaborators</strong>: Count the number of collaborators for a specific author.</p>
    </li>
    <li>
        <p><strong>Most Collaborative Author</strong>: Identify the author with the most collaborations.</p>
    </li>
</ul>
<h2>Screenshots</h2>
<img src="https://raw.githubusercontent.com/MYounesEG/AuthorGraphAnalyzer/refs/heads/main/Screenshots/screenshot1.png">
<img src="https://raw.githubusercontent.com/MYounesEG/AuthorGraphAnalyzer/refs/heads/main/Screenshots/screenshot2.png">
<img src="https://raw.githubusercontent.com/MYounesEG/AuthorGraphAnalyzer/refs/heads/main/Screenshots/screenshot3.png">
<img src="https://raw.githubusercontent.com/MYounesEG/AuthorGraphAnalyzer/refs/heads/main/Screenshots/screenshot4.png">
<img src="https://raw.githubusercontent.com/MYounesEG/AuthorGraphAnalyzer/refs/heads/main/Screenshots/screenshot5.png">

<h2>Installation</h2>
<ol start="1">
    <li>
        <p><strong>Clone the repository</strong>:</p>
        <div class="md-code-block">
            <div class="md-code-block-banner-wrap">
                <div class="md-code-block-banner">
                    <div class="md-code-block-infostring">bash</div>
                    <div class="md-code-block-action">
                        <div class="ds-markdown-code-copy-button">Copy</div>
                    </div>
                </div>
            </div>
            <pre><span class="token function">git</span> clone https://github.com/MYounesEG/myouneseg-authorgraphanalyzer.git
<span class="token builtin class-name">cd</span> myouneseg-authorgraphanalyzer</pre>
        </div>
    </li>
    <li>
        <p><strong>Install dependencies</strong>:<br>Make sure you have Python and Node.js installed. Then, install
            the required Python packages and Node.js dependencies:</p>
        <div class="md-code-block">
            <div class="md-code-block-banner-wrap">
                <div class="md-code-block-banner">
                    <div class="md-code-block-infostring">bash</div>
                    <div class="md-code-block-action">
                        <div class="ds-markdown-code-copy-button">Copy</div>
                    </div>
                </div>
            </div>
            <pre>pip <span class="token function">install</span> <span class="token parameter variable">-r</span> requirements.txt
<span class="token function">npm</span> <span class="token function">install</span></pre>
        </div>
    </li>
    <li>
        <p><strong>Run the Django server</strong>:</p>
        <div class="md-code-block">
            <div class="md-code-block-banner-wrap">
                <div class="md-code-block-banner">
                    <div class="md-code-block-infostring">bash</div>
                    <div class="md-code-block-action">
                        <div class="ds-markdown-code-copy-button">Copy</div>
                    </div>
                </div>
            </div>
            <pre>python manage.py runserver</pre>
        </div>
    </li>
    <li>
        <p><strong>Compile SCSS</strong>:<br>If you make changes to the SCSS files, you can compile them using:</p>
        <div class="md-code-block">
            <div class="md-code-block-banner-wrap">
                <div class="md-code-block-banner">
                    <div class="md-code-block-infostring">bash</div>
                    <div class="md-code-block-action">
                        <div class="ds-markdown-code-copy-button">Copy</div>
                    </div>
                </div>
            </div>
            <pre>npx sass app/static/app/scss/styles.scss app/static/app/css/styles.css</pre>
        </div>
    </li>
    <li>
        <p><strong>Start the application</strong>:<br>Use the provided <code>start.bat</code> script to compile
            SCSS, collect static files, and start the server:</p>
        <div>
            <pre>start.bat</pre>
        </div>
    </li>
</ol>
<h2>Usage</h2>
<ol start="1">
    <li>
        <p>Open your browser and navigate to <code>http://127.0.0.1:8000/</code>.</p>
    </li>
    <li>
        <p>Use the interactive graph to explore author collaborations.</p>
    </li>
    <li>
        <p>Click on the "Operations" button to perform various operations such as finding the shortest path,
            creating a collaboration queue, or visualizing a binary search tree.</p>
    </li>
</ol>
<h2>Contributors</h2>
<ul>
    <li>
        <p><strong><a href="https://github.com/MerveSevim44" target="_blank" rel="noreferrer">Merve
                    Sevim</a></strong></p>
    </li>
    <li>
        <p><strong><a href="https://github.com/MYounesEG" target="_blank" rel="noreferrer">Mohamed
                    Younes</a></strong></p>
    </li>
</ul>
<h2>License</h2>
<p>This project is licensed under the MIT License. See the <a href="LICENSE" target="_blank"
        rel="noreferrer">LICENSE</a> file for details.</p>
<h2>Acknowledgments</h2>
<ul>
    <li>
        <p>This project uses Django for the backend and D3.js for graph visualization.</p>
    </li>
    <li>
        <p>Special thanks to the contributors for their hard work and dedication.</p>
    </li>
</ul>
<h2>Contact</h2>
<p>For any questions or suggestions, feel free to reach out to the contributors via their GitHub profiles.</p>
<hr>
<p><strong>Note</strong>: Make sure to replace <code>LICENSE</code> with the actual license file if you have one. If
    you don't have a license file, you can create one or remove the reference to it in the README.</p>
