# Movie Titles

This project contains three possible approaches to the Zume Pizza Movie Titles test question.  The first two solutions, main.js and main2.js, have no external dependencies aside from node and can be run as-is:

' node.js main
' node.js main2

The third solution requires a JSON-parsing library that can be acquired by installing the project's NPM dependencies with either:

' npm install
' yarn install

...followed by...

' node main3

## Benchmark

The mainAll.js file is a repetition of the three solutions with their entry points exported.  This is meant to facilitate executing them through a benchmarking test harness, which can be found in bench.js.  Because the programs themselved produce a considerable amount of output, it is recommended to redirect standard out to /dev/null before running the benchmarks, which print their timing results to standard error to facilitate filtering them from the printed movie titles.

' node bench > /dev/null

## Discussion

The benchmark reveals no significant performance difference between these three solutions, so a comparison of their merits can only be made in terms of coding style--reusability and readability.

The first solution, main.js, involves the least amount of code, because it does not use any standard language features (e.g. Promises or Streams) that involve some additional boilerplate to satisfy their reuse syntax requirements.  This solution uses global state to store an array of all movie titles found so far, a counter that is incremented after each successful page download, and an expected page count value, initialized during the response handling for page 1.  It has two methods for HTTPS access, one for the first page load, and one for the Nth page load (N > 1).  Both routines call a common body handler method that does the global state access.  The difference between the methods for the first and Nth page loads boils down to some extra logic in the former.  On the first page access, in addition to parsing movie titles into the global area and checking for completion, the handler has to extract the total number of pages and initiate page downloads for the remaining N-1 pages.  Termination relies on the fact that the Node event loop does not preempt the flow control to schedule other ready units of work, but instead manages a dispatch queue as blocked tasks complete and return to the runnable state.  This allows the code to use a global counter, incremented once per execution of the onCompletion() method, to detect when all N pages have contributed their content to the global array.  When that happens, a conditional block of logic is executed that sorts the array and prints its content to the console.

The second solution, main2.js, uses Promises instead of global state to manage its progress towards completion.  It also uses Node Streams to avoid having to load each HTTPS response in memory before parsing the entire response into a JSON object.  It does not use any other libraries to assist with this approach, and so it does incur a cost for character decoding as it's search logic is based on regular expression matching, but it does not need to process more than a single Buffer worth of data at a time, keeping only the tail end of each buffered read in case of a Buffer boundary landing inside the content of a Title.  The work is refactored to two Transform stream subclasses, and one Writer subclass.  The Writer subclass is written to expect a series of Buffer inputs, each of which contains the content of one title.  The Parser Transform is called with a String that has been decoded from the latest Buffer and it applies a regular expression recursively to search for Titles, each of which it emits to the downstream Writer.  Finally, the Header Transform is responsible or searching for the total page count in the initial HTTPS request.  Before finding the page count, it emits nothing, since there are no titles in that part of the message.  After finding the page count, it becomes a no-op and passes all of its input to the Parser Transform.  Before becoming a no-op, the Header Transform also uses the page count value to spawn the remaining N-1 pipelines and collects a Promise from each.  With all N promises now avaialble, a call is made to Promise.all(), and a then handler is registered to receive the array of title arrays collected from each completed HTTPS request.

The third approach breaks the problem down in much the same way as the second, but instead of using string conversion and regular expressions, it uses a libary designed for mid-stream JSON parsing.  This library searches for matching blocks of interest in the Buffer byte stream, and only decodes the segments of interest.  It requires more lines of code than the first solution, but fewer than the second, thanks to the fact that it is written against a higher level of abstraction than the second solution.  Specifying the targets in terms of JSON paths is also less error prone than extracting content with regular expressions.  The second solution could be fooled by a Title that happens to contain the substring 'Title":', but the JSON parser will handle such corner cases accurately.  The JSONStream approach also allows for less code duplication by leveraging its "header" event handler to encapsulate the page count search without requiring different code paths for the first or Nth title searches.

The problems with the first solution's use of global state and the benefits of using Promises can be best observed by looking at what was done to enable reuse of the solutions with a Benchmarking library.  In order to benchmark any of these solutions, it was necessary to be able to recognize the moment when each solution had completed its title search.  In order to do that with the first solution, it had to be editted to account for zeroing out the global state and in order to pass a callback method all the way into the block where the title array was sorted and displayed, so that callback could be invoked after the print loop.  The two Promise-based solutions did not require such invasive tactics to add support for calling an on-completion handler.  Because they both returned a Promise from their main bodies that was only resolved after the on-completion print loop, no modifications were required and the benchmarking suite's handler method could simply be attached as a then handler of the SUT's function call.

Between the second and third solutions, the third is prefferable on stylistic reasons because the library it uses provides a level of abstraction that yields more readable and concise code.  The only reason to consider prefering the second solution would be a design constraint disallowing use of add-on modules, such as JSONStream..  Aside from the readability benefits, the JSONStream library works at the same level of abstraction as the message content, and so is well positioned to not be fooled into undefined behavior by corner cases such as a Title that contains 'Title":'.

# SQL Query

The relational query required to answer question three can be found in three.sql.

A script with content that creates the schema and loads some minimal testing data can be found in init.sql

As a bonus, a solution in Cypher, the Neo4J Graph Database's query language, can be found in three.cypher.

