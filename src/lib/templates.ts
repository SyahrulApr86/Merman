export interface Template {
    id: string;
    type: "mermaid" | "plantuml";
    name: string;
    description: string;
    code: string;
    docsUrl: string;
    isNew?: boolean;
    isBeta?: boolean;
}

export const TEMPLATES: Template[] = [
    // MERMAID TEMPLATES
    {
        id: "flowchart",
        type: "mermaid",
        name: "Flowchart",
        description: "Flowcharts are composed of nodes (geometric shapes) and edges (arrows or lines). The Mermaid code defines how nodes and edges are made and accommodates different arrow types, multi-directional arrows, and any linking to and from subgraphs.",
        docsUrl: "https://mermaid.js.org/syntax/flowchart.html",
        code: `graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No --> E[End]`,
    },
    {
        id: "sequence",
        type: "mermaid",
        name: "Sequence Diagram",
        description: "A Sequence diagram is an interaction diagram that shows how processes operate with one another and in what order.",
        docsUrl: "https://mermaid.js.org/syntax/sequenceDiagram.html",
        code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
    },
    {
        id: "class",
        type: "mermaid",
        name: "Class Diagram",
        description: "The class diagram is the main building block of object-oriented modeling. It is used for general conceptual modeling of the structure of the application, and for detailed modeling translating the models into programming code.",
        docsUrl: "https://mermaid.js.org/syntax/classDiagram.html",
        code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    class Fish {
        -int sizeInFeet
        -canEat()
    }
    class Zebra {
        +bool is_wild
        +run()
    }`,
    },
    {
        id: "state",
        type: "mermaid",
        name: "State Diagram",
        description: "A state diagram is a type of diagram used in computer science and related fields to describe the behavior of systems.",
        docsUrl: "https://mermaid.js.org/syntax/stateDiagram.html",
        code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
    },
    {
        id: "er",
        type: "mermaid",
        name: "Entity Relationship Diagram",
        description: "An entity–relationship model (or ER model) describes interrelated things of interest in a specific domain of knowledge. A basic ER model is composed of entity types (which classify the things of interest) and specifies relationships that can exist between entities.",
        docsUrl: "https://mermaid.js.org/syntax/entityRelationshipDiagram.html",
        code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
    },
    {
        id: "journey",
        type: "mermaid",
        name: "User Journey",
        description: "User journeys describe at a high level of detail exactly what steps different users take to complete a specific task within a system, application or website.",
        docsUrl: "https://mermaid.js.org/syntax/userJourney.html",
        code: `journey
    title My working day
    section Go to work
      Wake up: 1: Me, Cat
      Prepare for work: 3: Me
      Walk to bus stop: 5: Me
    section Go home
      Go to store: 5: Me
      Go home: 3: Me, Cat`,
    },
    {
        id: "gantt",
        type: "mermaid",
        name: "Gantt",
        description: "A Gantt chart is a type of bar chart that illustrates a project schedule. This chart lists the tasks to be performed on the vertical axis, and time intervals on the horizontal axis.",
        docsUrl: "https://mermaid.js.org/syntax/gantt.html",
        code: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,
    },
    {
        id: "pie",
        type: "mermaid",
        name: "Pie Chart",
        description: "A pie chart (or a circle chart) is a circular statistical graphic, which is divided into slices to illustrate numerical proportion.",
        docsUrl: "https://mermaid.js.org/syntax/pie.html",
        code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
    },
    {
        id: "quadrant",
        type: "mermaid",
        name: "Quadrant Chart",
        description: "A quadrant chart is a visual representation of data that is divided into four quadrants. It is used to plot data points on a two-dimensional grid.",
        docsUrl: "https://mermaid.js.org/syntax/quadrantChart.html",
        code: `quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]`,
    },
    {
        id: "requirement",
        type: "mermaid",
        name: "Requirement Diagram",
        description: "A Requirement Diagram provides a visualization for requirements and their connections, to other requirements and other model elements.",
        docsUrl: "https://mermaid.js.org/syntax/requirementDiagram.html",
        code: `requirementDiagram

    requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
    }

    element test_entity {
    type: simulation
    }

    test_entity - satisfies -> test_req`,
    },
    {
        id: "gitgraph",
        type: "mermaid",
        name: "GitGraph (Git) Diagram",
        description: "A Git Graph is a pictorial representation of git commits and git actions(commands) on various branches.",
        docsUrl: "https://mermaid.js.org/syntax/gitGraph.html",
        code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit`,
    },
    {
        id: "c4",
        type: "mermaid",
        name: "C4 Diagram",
        description: "C4 model is an 'abstraction-first' approach to diagramming software architecture, based upon abstractions that reflect how software architects and developers think about and build software.",
        docsUrl: "https://mermaid.js.org/syntax/c4.html",
        isBeta: true,
        code: `C4Context
    title System Context diagram for Internet Banking System
    Enterprise_Boundary(b0, "BankBoundary0") {
        Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
        Person(customerB, "Banking Customer B")
        Person_Ext(customerC, "Banking Customer C", "desc")

        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

        System_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

        Rel(customerA, SystemAA, "Uses")
        Rel(customerB, SystemAA, "Uses")
        Rel(customerC, SystemAA, "Uses")
        Rel(SystemAA, SystemE, "Uses")
    }`,
    },
    {
        id: "mindmap",
        type: "mermaid",
        name: "Mindmaps",
        description: "A mind map is a diagram used to visually organize information into a hierarchy, showing relationships among pieces of the whole.",
        docsUrl: "https://mermaid.js.org/syntax/mindmap.html",
        code: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping`,
    },
    {
        id: "timeline",
        type: "mermaid",
        name: "Timeline",
        description: "A timeline is a type of diagram used to illustrate a chronology of events, dates, or periods of time.",
        docsUrl: "https://mermaid.js.org/syntax/timeline.html",
        code: `timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : Youtube
    2006 : Twitter`,
    },
    {
        id: "zenuml",
        type: "mermaid",
        name: "ZenUML",
        description: "ZenUML is a sequence diagram tool that allows you to create sequence diagrams using a simple DSL.",
        docsUrl: "https://mermaid.js.org/syntax/zenuml.html",
        code: `zenuml
    title ZenUML
    Alice->Bob: Hello Bob, how are you?
    Bob->Alice: I am good thanks!`,
    },
    {
        id: "sankey",
        type: "mermaid",
        name: "Sankey",
        description: "A Sankey diagram is a visualization used to depict a flow from one set of values to another.",
        docsUrl: "https://mermaid.js.org/syntax/sankey.html",
        isNew: true,
        code: `sankey-beta
    Agricultural 'waste',Bio-conversion,124.729
    Bio-conversion,Liquid,0.597
    Bio-conversion,Losses,26.862
    Bio-conversion,Solid,280.322
    Bio-conversion,Gas,81.144`,
    },
    {
        id: "xychart",
        type: "mermaid",
        name: "XY Chart",
        description: "An XY Chart is a chart that displays data on two axes, X and Y.",
        docsUrl: "https://mermaid.js.org/syntax/xyChart.html",
        isNew: true,
        code: `xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 10000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 10000, 10200, 9200, 8500, 7000, 6000]`,
    },
    {
        id: "block",
        type: "mermaid",
        name: "Block Diagram",
        description: "A block diagram is a diagram of a system in which the principal parts or functions are represented by blocks connected by lines that show the relationships of the blocks.",
        docsUrl: "https://mermaid.js.org/syntax/block.html",
        isNew: true,
        code: `block-beta
    columns 1
    db(("DB"))
    blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
    block:ID
        A
        B["A wide one in the middle"]
        C
    end
    space
    D
    ID --> D
    C --> D
    style B fill:#969,stroke:#333,stroke-width:4px`,
    },
    {
        id: "packet",
        type: "mermaid",
        name: "Packet",
        description: "A packet diagram is a visualization of the structure of a network packet.",
        docsUrl: "https://mermaid.js.org/syntax/packet.html",
        isNew: true,
        code: `packet-beta
    0-15: "Source Port"
    16-31: "Destination Port"
    32-63: "Sequence Number"
    64-95: "Acknowledgment Number"
    96-99: "Data Offset"
    100-105: "Reserved"
    106: "URG"
    107: "ACK"
    108: "PSH"
    109: "RST"
    110: "SYN"
    111: "FIN"
    112-127: "Window"
    128-143: "Checksum"
    144-159: "Urgent Pointer"
    160-191: "(Options and Padding)"
    192-255: "Data"`,
    },
    {
        id: "kanban",
        type: "mermaid",
        name: "Kanban",
        description: "A Kanban diagram is a visualization of a Kanban board, which is a tool used to visualize work, limit work-in-progress, and maximize efficiency (or flow).",
        docsUrl: "https://mermaid.js.org/syntax/kanban.html",
        isNew: true,
        code: `kanban
    Todo
        [Create documentation]
        [Create template]
    Doing
        [Develop feature]
    Done
        [Design interface]`,
    },
    {
        id: "architecture",
        type: "mermaid",
        name: "Architecture",
        description: "An architecture diagram is a visualization of the architecture of a system.",
        docsUrl: "https://mermaid.js.org/syntax/architecture.html",
        isNew: true,
        code: `architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk:T -- B:server`,
    },

    // PLANTUML TEMPLATES
    {
        id: "puml-sequence",
        type: "plantuml",
        name: "Sequence Diagram",
        description: "Sequence Diagram with participants, messages, and notes.",
        docsUrl: "https://plantuml.com/sequence-diagram",
        code: `@startuml
actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: RequestCreated
deactivate B

A --> User: Done
deactivate A
@enduml`,
    },
    {
        id: "puml-usecase",
        type: "plantuml",
        name: "Use Case Diagram",
        description: "Use Case Diagram showing actors and use cases.",
        docsUrl: "https://plantuml.com/use-case-diagram",
        code: `@startuml
left to right direction
actor "Food Critic" as fc
rectangle Restaurant {
  usecase "Eat Food" as UC1
  usecase "Pay for Food" as UC2
  usecase "Drink" as UC3
}
fc --> UC1
fc --> UC2
fc --> UC3
@enduml`,
    },
    {
        id: "puml-class",
        type: "plantuml",
        name: "Class Diagram",
        description: "Class Diagram with relations and members.",
        docsUrl: "https://plantuml.com/class-diagram",
        code: `@startuml
class Car {
  - engine: Engine
  + start(): void
  + stop(): void
}

class Engine {
  - horsepower: int
}

class Wheel {
  + size: int
}

Car *-- Engine : has >
Car o-- "4" Wheel : has >
@enduml`,
    },
    {
        id: "puml-object",
        type: "plantuml",
        name: "Object Diagram",
        description: "Object Diagram showing instances.",
        docsUrl: "https://plantuml.com/object-diagram",
        code: `@startuml
object user1 {
  name = "John Doe"
  id = 123
}

object user2 {
  name = "Jane Doe"
  id = 124
}

user1 -> user2 : friend
@enduml`,
    },
    {
        id: "puml-activity",
        type: "plantuml",
        name: "Activity Diagram (Beta)",
        description: "Activity Diagram using the new beta syntax.",
        docsUrl: "https://plantuml.com/activity-diagram-beta",
        code: `@startuml
start
:ClickServlet.handleRequest();
:new page;
if (Page.onSecurityCheck) then (true)
  :Page.onInit();
  if (isForward?) then (no)
    :Process controls;
    if (continue processing?) then (no)
      stop
    endif

    if (isPost?) then (yes)
      :Page.onPost();
    else (no)
      :Page.onGet();
    endif
    :Page.onRender();
  endif
else (false)
endif

if (do redirect?) then (yes)
  :redirect process;
else
  if (do forward?) then (yes)
    :Forward request;
  else (no)
    :Render page template;
  endif
endif

stop
@enduml`,
    },
    {
        id: "puml-component",
        type: "plantuml",
        name: "Component Diagram",
        description: "Component Diagram showing components and interfaces.",
        docsUrl: "https://plantuml.com/component-diagram",
        code: `@startuml
package "Some Group" {
  HTTP - [First Component]
  [Another Component]
}

node "Other Groups" {
  FTP - [Second Component]
  [First Component] --> FTP
}

cloud {
  [Example 1]
}

database "MySql" {
  folder "This is my folder" {
    [Folder 3]
  }
  frame "Foo" {
    [Frame 4]
  }
}

[Another Component] --> [Example 1]
[Example 1] --> [Folder 3]
[Folder 3] --> [Frame 4]
@enduml`,
    },
    {
        id: "puml-deployment",
        type: "plantuml",
        name: "Deployment Diagram",
        description: "Deployment Diagram showing nodes and artifacts.",
        docsUrl: "https://plantuml.com/deployment-diagram",
        code: `@startuml
node "Web Server" as web {
    artifact "Application.war" as app
}

node "Database Server" as db {
    database "MySQL" as mysql
}

app --> mysql : JDBC
@enduml`,
    },
    {
        id: "puml-state",
        type: "plantuml",
        name: "State Diagram",
        description: "State Diagram showing state transitions.",
        docsUrl: "https://plantuml.com/state-diagram",
        code: `@startuml
[*] --> NotShooting

state "Not Shooting State" as NotShooting {
  [*] --> Idle
  Idle --> Configuring : EvConfig
  Configuring --> Idle : EvConfig
}

state "Shooting State" as Shooting {
  [*] --> Preparing
  Preparing --> Firing : Timer Fired
  Firing --> Preparing : Timer Fired
}

NotShooting --> Shooting : EvShutterPressed
Shooting --> NotShooting : EvShutterReleased
@enduml`,
    },
    {
        id: "puml-timing",
        type: "plantuml",
        name: "Timing Diagram",
        description: "Timing Diagram showing events over time.",
        docsUrl: "https://plantuml.com/timing-diagram",
        code: `@startuml
robust "DNS Resolver" as DNS
robust "Web Browser" as WB
concise "Web User" as WU

@0
WU is Idle
WB is Idle
DNS is Idle

@+100
WU -> WB : URL
WU is Waiting
WB is Processing

@+200
WB is Waiting
WB -> DNS@+50 : Resolve URL

@+100
DNS is Processing

@+300
DNS is Idle
@enduml`,
    },
    {
        id: "puml-json",
        type: "plantuml",
        name: "JSON Data",
        description: "Visualization of JSON data.",
        docsUrl: "https://plantuml.com/json",
        code: `@startjson
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "children": [],
  "spouse": null
}
@endjson`,
    },
    {
        id: "puml-yaml",
        type: "plantuml",
        name: "YAML Data",
        description: "Visualization of YAML data.",
        docsUrl: "https://plantuml.com/yaml",
        code: `@startyaml
doe: "a deer, a female deer"
ray: "a drop of golden sun"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
  - huey
  - dewey
  - louie
  - fred
xmas-fifth-day:
  calling-birds: four
  french-hens: 3
  golden-rings: 5
  partridges:
    count: 1
    location: "a pear tree"
@endyaml`,
    },
    {
        id: "puml-ebnf",
        type: "plantuml",
        name: "EBNF",
        description: "Extended Backus-Naur Form diagram.",
        docsUrl: "https://plantuml.com/ebnf",
        code: `@startebnf
title "EBNF Example"
expression = term , { ("+" | "-") , term } ;
term       = factor , { ("*" | "/") , factor } ;
factor     = number | "(" , expression , ")" ;
number     = digit , { digit } ;
digit      = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
@endebnf`,
    },
    {
        id: "puml-regex",
        type: "plantuml",
        name: "Regex",
        description: "Regular Expression visualization.",
        docsUrl: "https://plantuml.com/regex",
        code: `@startregex
/(\d{4})-(\d{2})-(\d{2})/
@endregex`,
    },
    {
        id: "puml-network",
        type: "plantuml",
        name: "Network Diagram (nwdiag)",
        description: "Network diagram visualization.",
        docsUrl: "https://plantuml.com/nwdiag",
        code: `@startuml
nwdiag {
  network dmz {
    address = "210.x.x.x/24"

    web01 [address = "210.x.x.1"];
    web02 [address = "210.x.x.2"];
  }
  network internal {
    address = "172.x.x.x/24";

    web01 [address = "172.x.x.1"];
    web02 [address = "172.x.x.2"];
    db01;
    db02;
  }
}
@enduml`,
    },
    {
        id: "puml-salt",
        type: "plantuml",
        name: "Salt (UI Mockup)",
        description: "Wireframe / UI mockup.",
        docsUrl: "https://plantuml.com/salt",
        code: `@startsalt
{
  Just plain text
  [This is my button]
  ()  Unchecked radio
  (X) Checked radio
  []  Unchecked box
  [X] Checked box
  "Enter text here   "
  ^This is a droplist^
}
@endsalt`,
    },
    {
        id: "puml-archimate",
        type: "plantuml",
        name: "Archimate",
        description: "Archimate diagram.",
        docsUrl: "https://plantuml.com/archimate-diagram",
        code: `@startuml
archimate #Strategy "Strategy"  as strategy
archimate #Business "Business"  as business
archimate #Application "Application" as application
archimate #Technology "Technology"  as technology
archimate #Physical "Physical"  as physical
archimate #Implementation "Implementation" as implementation

strategy -> business
business -> application
application -> technology
technology -> physical
physical -> implementation
@enduml`,
    },
    {
        id: "puml-gantt",
        type: "plantuml",
        name: "Gantt Chart",
        description: "Gantt chart for project planning.",
        docsUrl: "https://plantuml.com/gantt-diagram",
        code: `@startgantt
[Prototype design] lasts 15 days
[Test prototype] lasts 10 days
[Test prototype] starts at [Prototype design]'s end
[Prototype design] is colored in Fuchsia/FireBrick
[Test prototype] is colored in GreenYellow/Green
@endgantt`,
    },
    {
        id: "puml-mindmap",
        type: "plantuml",
        name: "MindMap",
        description: "Mindmap diagram.",
        docsUrl: "https://plantuml.com/mindmap-diagram",
        code: `@startmindmap
* Linux
** NixOS
** Debian
*** Ubuntu
**** Linux Mint
**** Kubuntu
**** Lubuntu
**** KDE Neon
*** LMDE
*** SolydXK
*** SteamOS
*** Raspbian
@endmindmap`,
    },
    {
        id: "puml-wbs",
        type: "plantuml",
        name: "WBS",
        description: "Work Breakdown Structure.",
        docsUrl: "https://plantuml.com/wbs-diagram",
        code: `@startwbs
* Business Process Modelling WBS
** Launch the project
*** Complete Stakeholder Research
*** Initial Scope Definition
** Design phase
*** Model of AsIs Processes Completed
**** Model of AsIs Processes Completed1
**** Model of AsIs Processes Completed2
*** Measure AsIs performance metrics
*** Identify Quick Wins
** Complete innovate phase
@endwbs`,
    },
    {
        id: "puml-math",
        type: "plantuml",
        name: "Math (AsciiMath)",
        description: "Mathematical formulas.",
        docsUrl: "https://plantuml.com/ascii-math",
        code: `@startmath
f(t)=(a_0)/2 + sum_(n=1)^ooa_ncos((n pi t)/L)+sum_(n=1)^oo b_n sin((n pi t)/L)
@endmath`,
    },
    {
        id: "puml-ie",
        type: "plantuml",
        name: "Information Engineering (IE)",
        description: "Entity Relationship using IE notation.",
        docsUrl: "https://plantuml.com/ie-diagram",
        code: `@startuml
entity Entity01 {
  *identifying_attribute
  --
  *mandatory_attribute
  optional_attribute
}

entity Entity02 {
  *identifying_attribute
  --
  *mandatory_attribute
  optional_attribute
}

Entity01 ||..|{ Entity02
Entity03 }|..|{ Entity04
@enduml`,
    },
];
