### ListenersCtrl.js
Managing event listeners in the browser environment

### Brief description
A tool for associating an element with
a number of callback functions that allows shortcut connection / disconnection
of them as event listeners.

### Node package name: listenersctrl

### Source files
* ./umd/listenersctrl.js: HTML embedded script, CommonJS module
* ./umd/listenersctrl.min.js: HTML embedded script, CommonJS module (minified)
* ./esm/listenersctrl.js: ES module

### Importing from the ES module
```javascript
import { ListenersCtrl, ListenersAggt } from 'listenersctrl.js';
```

### Some ways of using
```javascript
var wLstn = ListenersCtrl(window);

/**(connect one listener and then replace it with the other)**/
wLstn.Append('click', function(ev) { alert('f()'); });
//.................................................//
wLstn.Apply('click', function(ev) { alert('g()'); });

/******(associate listeners but connect them to the element later on)*******/
wLstn.AssociateArray([
    ['click', function(ev) { alert('f()'); }],
    ['click', function(ev) { alert('g()'); }],
]);
//...........................................//
wLstn.Connect();

/******(using markers to specify a group of listeners)*********/
wLstn.AppendArray([
    ['click', function(ev) { alert('g1()'); }],
    ['click', function(ev) { alert('g2()'); }],
]).As('g');
//..........................................//
wLstn.Select('g').Disconn();

/***************(remove all listeners)***************/
wLstn.Clear();
```

### Instantiating
#### With the built-in container of instances named *ListenersAggt*. It holds a single instance for each element passed.
```javascript
ListenersAggt.Element('#cssSelector').Associate('click', function(ev) { alert('f()'); });
ListenersAggt.Element('#cssSelector', 'a').Associate('click', function(ev) { alert('g()'); });
ListenersAggt.Alias('a').Connect();
```
#### With constructor *ListenersCtrl*(&lt;Element or CssSelector&gt;)
```javascript
var eLstn = ListenersCtrl('#cssSelector');
eLstn.Associate('click', function(ev) { alert('f()'); });
eLstn.Associate('click', function(ev) { alert('g()'); });
eLstn.Connect();
```
If an instance was created by *ListenersCtrl* function, it is not accessible by *ListenersAggt* methods

### Parameters of methods

#### Altogether there are four sets of parameters of methods, that is any method accepts at least one of these sets:
* C) Conventional set, that is the same set as that of DOM API functions: <br />
(**&lt;event type&gt;**: string, **&lt;callback&gt;**: function, (optional)**&lt;useCapture&gt;**: boolean(default=false))
* A) Array formed of elements of the aforementioned set: <br />
([ [**&lt;event type&gt;**: string, **&lt;callback&gt;**: function, (optional)**&lt;useCapture&gt;**: boolean(default=false)], [ ... ], ])
* S) Filtering parameters: <br />
(**&lt;marker&gt;**: any, (optional)**&lt;event listener options&gt;**: object) <br />
where **&lt;event listener options&gt;** object can have the following properties: [type], [listener], [useCapture], [connected]
* V) Call without parameters

#### And there are two ways of passing parameters:
* d) Direct through the method parameters
* f) Indirect through the results of the previous call of a filtering method (*Select*)

#### Conventions
* The names of the methods start with a capital letter
* Methods accepting arrays have *Array* postfix, that is the call looks like &lt;Mathod Name&gt;Array(...)
* If a method can be called without being supplied with any parameters, it means that in such case it takes into account all data accessible
* If a method functionality isn't of returning any specific result it returns the instance, so that chained call can be used

### Description of the semantics of the method names with a enumeration of all possible ways of calling (in square brackets) 
* [(C)(A)(-)(--)(fV)] *Append*: to pass parameters to *addEventListener()* and to keep them for further operations
* [(C)(A)(-)(--)(fV)] *Apply*: the same actions as those of sequential calls of methods *Clear* and *Append*
* [(C)(A)(-)(--)(fV)] *Associate*: to keep parameters for further operations e.g. connection
* [(C)(A)(-)(--)(fV)] *Prepend*: the same as *Append* but listeners being connected will be first in the order of invocation 
* [(-)(-)(S)(dV)(fV)] *Disconn*: to pass selected parameter sets of those being currently kept to *removeEventListener()* and to continue keeping them
* [(-)(-)(S)(dV)(fV)] *Connect*: to pass selected parameter sets of those being currently kept to *addEventListener()* and to continue keeping them
* [(-)(-)(-)(dV)(fV)] *Invoke*: to invoke sequentially callback functions obtained from parameter sets being currently kept 
(the value of *this* will be bound to the element the instance was associated with)
* [(-)(-)(-)(dV)(fV)] *InvokeConn*: to invoke sequentially callback functions that have been connected as event listeners 
(the value of *this* will be bound to the element the instance was associated with)
* [(-)(-)(-)(dV)(fV)] *Count*: to return the number of parameter sets being currently kept
* [(-)(-)(-)(dV)(fV)] *CountConn*: to return the number of callback functions that are connected as event listeners
* [(C)(-)(-)(--)(fV)] *Remove*: to call *removeEventListener()* with specified parameter set(s) and not to keep it(them) anymore

( Methods *Invoke* and *InvokeConn* can also be supplied with an argument or an array of arguments 
which every callback function will be called with )

### Methods available on chained calls:
* [(-)(-)(S)(--)(--)] *As*: assign a marker to parameter sets of the preceding call so that they can be referred to by the marker later on 

### Methods unavailable right after calling *Select* method
* [(-)(-)(S)(--)(--)] *Select*: to define criteria which parameter sets of those being currently kept will be used in the next adjacent call
* [(C)(-)(-)(--)(--)] *IsAssociated*: to check whether such a set of parameters has already been added
* [(C)(-)(-)(--)(--)] *IsConnected*: to check whether there is an event listener connected with such a set of parameters
* [(-)(-)(-)(dV)(--)] *Clear*: to call *removeEventListener()* for each parameter set of those being currently kept and not to keep them anymore
* [(-)(-)(-)(dV)(--)] *GetElement*: to return the element the instance is associated with

### Description of the methods of the instances aggregator (*ListenersAggt*) with a declaration of their parameters:
* *Element* (**&lt;Element or CssSelector&gt;**, (optional)**&lt;Marker&gt;**): finds and returns an instance for 
the specified element and if it's not found creates one and optionally assigns a marker to it
* *Alias* (**&lt;Marker&gt;**): returns an instance that was assigned specified marker to
* *Release* ((optional)**&lt;Element or CssSelector&gt;**): removes from the aggregator a specific instance or all instances maintained 
(if called without the argument) but doesn't remove connected event listeners
* *ReleaseByAlias*(**&lt;Marker&gt;**): the same actions as those of *Release* method
* *Clear* ((optional)**&lt;Element or CssSelector&gt;**): removes from the aggregator an instance or all instances maintained 
(if called without the argument) and removes all event listeners connected by means of that(those) instance(s)
* *ClearByAlias*(**&lt;Marker&gt;**): the same actions as those of *Clear* method

### Types of parameters:
* **&lt;Element or CssSelector&gt;**: Element or string
* **&lt;Marker&gt;**: any

### Some other examples
```javascript
/********(connecting and disconnecting listeners of specific event type)********/
wLstn.Select(null, {type:'click'}).Connect();
wLstn.Select(null, {type:'click'}).Disconn();

/*******(reversing the order of invocation)***********************/
wLstn.Append('click', function(ev) { alert('f()'); }).As('a');
wLstn.Append('click', function(ev) { alert('g()'); }).As('b');
wLstn.Append('click', function(ev) { alert('h()'); }).As('c');
wLstn.Select('b').Append().Select('a').Append();

/******************(merging two markers)********************/
wLstn.Append('click', function(ev) { alert('f()'); }).As(0);
wLstn.Append('click', function(ev) { alert('g()'); }).As(1);
wLstn.Select(0).As(1);
wLstn.Select(0).Count(); //0;
wLstn.Select(1).Count(); //2;
```
An example of utilizing can be found in the file *example.html*
