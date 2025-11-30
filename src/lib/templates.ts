export interface Template {
    id: string;
    name: string;
    description: string;
    code: string;
    docsUrl: string;
    isNew?: boolean;
    isBeta?: boolean;
}

export const TEMPLATES: Template[] = [
    {
        id: "flowchart",
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
];
