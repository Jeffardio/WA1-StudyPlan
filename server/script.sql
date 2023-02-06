-- SQLite
CREATE TABLE student (
    stud_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    'full' INTEGER NOT NULL,
    PRIMARY KEY(stud_id)
)
CREATE TABLE course (
    code TEXT  NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    max_stud INTEGER ,
    act INTEGER, 
    pre TEXT ,
    PRIMARY KEY(code),
    FOREIGN KEY(pre) REFERENCES course(code)
)

CREATE TABLE incompatibility (
    course TEXT NOT NULL,
    incomp TEXT NOT NULL,
    PRIMARY KEY (course, incomp),
    FOREIGN KEY (course) REFERENCES course(code),
    FOREIGN KEY (incomp) REFERENCES course(code)
)

CREATE TABLE study_plan (
    student INTEGER NOT NULL,
    course TEXT NOT NULL,
    PRIMARY KEY(student, course),
    FOREIGN KEY(student) REFERENCES student(stud_id),
    FOREIGN KEY(course) REFERENCES course(code)
)




INSERT INTO course (code, name, credits, max_stud, act, pre) VALUES 
('02GOLOV', 'Architetture dei sistemi di elaborazione', 12, NULL, 0,NULL),
('02LSEOV','Computer architectures', 12, NULL, 0,NULL),
('01SQJOV', 'Data Science and Database Technology ', 8, NULL, 0,NULL),
('01SQMOV','Data Science e Tecnologie per le Basi di Dati', 8, NULL, 0,NULL),
('01SQLOV','Database systems', 8, NULL, 0,NULL),
('01OTWOV','Computer network technologies and services ', 6, 3, 0,NULL),
('02KPNOV','Tecnologie e servizi di rete', 6, 3, 0,NULL),
('01TYMOV','Information systems security services', 12, NULL, 0,NULL),
('01UDUOV','Sicurezza dei sistemi informativi', 12, NULL, 0,NULL),
('05BIDOV','Ingegneria del software', 6, NULL, 0,'02GOLOV'),
('04GSPOV','Software engineering', 6, NULL, 0,'02LSEOV'),
('01UDFOV','Applicazioni Web I', 6, NULL, 0,NULL),
('01TXYOV','Web Applications I', 6, 3, 0,NULL),
('01TXSOV','Web Applications II', 6, NULL, 0,'01TXYOV'),
('02GRSOV','Programmazione di sistema', 6, NULL, 0,NULL),
('01NYHOV','System and device programming', 6, 3, 0,NULL),
('01SQOOV','Reti Locali e Data Center', 6, NULL, 0,NULL),
('01TYDOV','Software networking', 7, NULL, 0,NULL),
('03UEWOV','Challenge', 5, NULL, 0,NULL),
('01URROV','Computational intelligence', 6, NULL, 0,NULL),
('01OUZPD','Model based software design', 4, NULL, 0,NULL),
('01URSPD','Internet Video Streaming', 6, 2, 0,NULL)


INSERT INTO incompatibility (course, incomp) VALUES 
('02GOLOV','02LSEOV'),
('02LSEOV','02GOLOV'),
('01SQJOV','01SQMOV'),
('01SQJOV','01SQLOV'),
('01SQMOV','01SQJOV'),
('01SQMOV','01SQLOV'),
('01SQLOV','01SQJOV'),
('01SQLOV','01SQMOV'),
('01OTWOV','02KPNOV'),
('02KPNOV','01OTWOV'),
('01TYMOV','01UDUOV'),
('01UDUOV','01TYMOV'),
('05BIDOV','04GSPOV'),
('04GSPOV','05BIDOV'),
('01UDFOV','01TXYOV'),
('01TXYOV','01UDFOV'),
('02GRSOV','01NYHOV'),
('01NYHOV','02GRSOV')

