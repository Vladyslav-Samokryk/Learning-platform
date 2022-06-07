import { Client } from "ketting";
import moment from "moment";
import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Nav, Navbar, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const client = new Client("http://localhost:8080/");
delete client.contentTypeMap["text/html"];

const originalFetch = client.fetcher.fetch.bind(client.fetcher);
client.fetcher.fetch = function (resource, init) {
  if (!init.headers) {
    init.headers = new Headers();
  }
  init.headers.append("X-Requested-With", "XMLHttpRequest");
  if (init.headers.get("Content-Type") === "multipart/form-data") {
    init.headers.delete("Content-Type");
  }
  return originalFetch(resource, { ...init, credentials: "include" });
}

function App() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    (async () => {
      setAuthenticated(await isAuthenticated());
    })();
  }, []);

  function onClickLogin(e) {
    e.preventDefault();
    setAuthenticated(null);
    (async () => {
      const creds = {
        username: e.target.username.value,
        password: e.target.password.value
      };
      setAuthenticated(await isAuthenticated(creds) || "error");
    })();
  }

  function onClickLogout(e) {
    e.preventDefault();
    doLogout();
    setAuthenticated(false);
    navigate("/", { replace: true });
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">Learning Platform</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Courses</Nav.Link>
            <Nav.Link as={Link} to="/account">My Account</Nav.Link>
          </Nav>
          {(authenticated === true) && (
            <Navbar.Text>
              <a href="#" onClick={onClickLogout}>Logout</a>
            </Navbar.Text>
          )}
        </Container>
      </Navbar>
      {(authenticated === true) && (
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/course" element={<Course />} />
          <Route path="/course/students" element={<StudentsAndRequests />} />
          <Route path="/course/gradebook" element={<Gradebook />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Info text="Not Found" />} />
        </Routes>
      )}
      {(authenticated === false || authenticated === "error") && (
        <LoginRegister authenticated={authenticated} onClickLogin={onClickLogin} />
      )}
      {(authenticated === null) && (
        <Info text="Loading..." />
      )}
    </>
  );
}

function Account() {
  const location = useLocation();

  const { userUri } = location.state || {};

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);

  async function reload() {
    const currentUser = await (await client.follow("users").follow("currentUser")).get();
    setCurrentUser(currentUser);

    if (userUri) {
      setUser(await client.go(userUri).get());
    } else {
      setUser(currentUser);
    }
  }

  useEffect(() => { reload(); }, [userUri]);

  function onClickEdit(e) {
    setEditing(true);
  }

  async function onClickSave(e) {
    await client.go(user.uri).patch({
      headers: {
      },
      data: user.data
    })
    setEditing(false);
  }

  function onChangeInput(e) {
    user.data[e.target.name] = e.target.value;
  }

  if (!user || !currentUser) return <Info text="Loading..." />;

  const canEdit = user.uri === currentUser.uri;

  return (
    <SplitPane
      content={
        <Row className="justify-content-center">
          <Col md="5" className="border border-2 rounded">
            <Row>
              <Col xs="4">
                <div className="my-2 fs-5">Full name:</div>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                {!editing && (
                  <>
                    <div className="fs-5">{user.data.fullName}</div>
                  </>
                )}
                {editing && (
                  <>
                    <Form.Control size="sm" type="text" name="fullName" placeholder="Full name" required
                      defaultValue={user.data.fullName} onChange={onChangeInput} />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col xs="4">
                <div className="my-2 fs-5">Email:</div>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                {!editing && (
                  <>
                    <div className="fs-5">{user.data.email}</div>
                  </>
                )}
                {editing && (
                  <>
                    <Form.Control size="sm" type="email" name="email" placeholder="Email" required
                      defaultValue={user.data.email} onChange={onChangeInput} />
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col xs="4">
                <div className="my-2 fs-5">Username:</div>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                {!editing && (
                  <>
                    <div className="fs-5">{user.data.username}</div>
                  </>
                )}
                {editing && (
                  <>
                    <Form.Control size="sm" type="text" name="username" placeholder="Username" required
                      defaultValue={user.data.username} onChange={onChangeInput} />
                  </>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      }
      sidebarRight={canEdit && (
        <>
          {!editing && (
            <Button variant="primary" size="sm w-100 mt-3" onClick={onClickEdit}>
              Edit
            </Button>
          )}
          {editing && (
            <Button variant="success" size="sm w-100 mt-3" onClick={onClickSave}>
              Save
            </Button>
          )}
        </>
      )} />
  );
}

function LoginRegister(props) {
  const [showRegister, setShowRegister] = useState(false);
  const [loginStatus, setLoginStatus] = useState(props.authenticated);
  if (showRegister) {
    return <Register gotoLogin={(status) => { setShowRegister(false); setLoginStatus(status); }} />;
  }
  return <Login status={loginStatus} onClickLogin={props.onClickLogin}
    gotoRegister={() => setShowRegister(true)} />;
}

function Login(props) {
  return (
    <SplitPane
      content={
        <Row className="justify-content-center">
          <Col md="4">
            <h3 className="text-center">Welcome!</h3>
            {(props.status === "error") && (
              <Alert variant="danger" className="mt-4">Invalid username or password</Alert>
            )}
            {(props.status === "register") && (
              <Alert variant="success" className="mt-4">Successfully registered</Alert>
            )}
            <Form onSubmit={props.onClickLogin}>
              <Form.Control type="text" name="username" placeholder="Username" className="mt-4" required />
              <Form.Control type="password" name="password" placeholder="Password" className="mt-2" required />
              <Button variant="outline-primary" size="sm" type="submit" className="w-100 mt-4">Login</Button>
            </Form>
            <p className="small mt-2">
              Don"t have an account? <a href="#" onClick={(e) => { e.preventDefault(); props.gotoRegister(); }}>Register</a>
            </p>
          </Col>
        </Row>
      } />
  );
}

function Register(props) {
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  function onClickRegister(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const fullName = e.target.fullName.value;
    const username = e.target.username.value;
    const password = e.target.password.value;
    doRegister(fullName, username, password, email);
    props.gotoLogin("register");
  }

  function checkPasswords(e) {
    const password = e.target.parentElement.password.value;
    const repeatPassword = e.target.parentElement.repeatPassword.value;
    setPasswordsMatch(password === repeatPassword);
  }

  return (
    <SplitPane
      content={
        <Row className="justify-content-center">
          <Col md="4">
            <h3 className="text-center">Welcome!</h3>
            <Form onSubmit={onClickRegister}>
              <Form.Control type="text" name="fullName" placeholder="Full name" className="mt-4" required />
              <Form.Control type="email" name="email" placeholder="Email" className="mt-2" required />
              <Form.Control type="text" name="username" placeholder="Username" className="mt-2" required />
              <Form.Control type="password" name="password" placeholder="Password" onChange={checkPasswords} className="mt-2" required />
              <Form.Control type="password" name="repeatPassword" placeholder="Repeat password" onChange={checkPasswords} className="mt-2" required />
              <p className={"small text-danger" + (passwordsMatch ? " invisible" : "")}>Passwords do not match</p>
              <Button variant="outline-primary" size="sm" type="submit" disabled={!passwordsMatch} className="w-100">Register</Button>
            </Form>
            <p className="small mt-2">
              Already registered? <a href="#" onClick={(e) => { e.preventDefault(); props.gotoLogin(""); }}>Login</a>
            </p>
          </Col>
        </Row>
      } />
  );
}

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    (async () => {
      const courseCollection = await (await client.follow("courses")).get();
      setCourses(await Promise.all(courseCollection.followAll("courses").map(res => res.get())));
      setCanEdit(courseCollection.links.has("edit"));
    })();
  }, []);

  async function onClickNewCourse() {
    const newCourseResource = await (await client.follow("courses")).postFollow({
      data: {
        title: "New Course",
        description: "<h1 class=\"ql-align-center\">TODO</h1>\n"
      }
    });
    navigate("/course", { state: { courseUri: newCourseResource.uri } });
  }

  if (!courses) return <Info text="Loading..." />;

  return (
    <SplitPane
      sidebarLeft={
        <h3 className="text-center pt-2">Welcome!</h3>
      }
      content={
        <>
          <h3 className="text-center">Available Courses</h3>
          <Table striped>
            <thead>
              <tr>
                <th>Title</th>
                <th style={{ width: "200px" }}>Students</th>
              </tr>
            </thead>
            <tbody>
              {courses
                .map(course =>
                  <tr key={course.uri}>
                    <td>
                      <Link to={"/course"} state={{ courseUri: course.uri }} className="fs-5 text-decoration-none">
                        {course.data.title}
                      </Link>
                    </td>
                    <td>
                      {course.data.studentCount}
                    </td>
                  </tr>
                )}
            </tbody>
          </Table>
        </>
      }
      sidebarRight={canEdit && (
        <Button variant="outline-success" size="sm w-100 mt-3" onClick={(e) => { e.preventDefault(); onClickNewCourse(); }}>
          New Course
        </Button>
      )} />
  );
}

function Course() {
  const location = useLocation()
  const navigate = useNavigate();

  const { courseUri, itemUri } = location.state;

  const [course, setCourse] = useState(null);
  const [items, setItems] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [mySolution, setMySolution] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [accessRequested, setAccessRequested] = useState(false);
  const [users, setUsers] = useState(null);

  async function reload() {
    setCourse(null);
    setItems(null);
    setCurrentItem(null);
    setEditing(false);
    setMySolution(null);
    setSolutions(null);
    setAccessRequested(false);
    setUsers(null);

    const course = await client.go(courseUri).get();
    setCourse(course);

    const itemResources = await course.follow("items", { "projection": "courseItemWithComments" }).followAll("items");
    setItems(await Promise.all(itemResources.map(res => res.get())));

    if (itemUri) {
      const currentItem = await client.go(itemUri).get();
      setCurrentItem(currentItem);

      if (currentItem.links.has("my-solution")) {
        const mySolution = await client.go(currentItem.links.get("my-solution")).get();
        setMySolution(mySolution);
      }

      if (course.links.has("edit") && currentItem.links.has("solutions")) {
        const solutionResources = await currentItem.follow("solutions").followAll("solutions");
        setSolutions(await Promise.all(solutionResources.map(res => res.get())));
      }
    }

    const userResources = await (await client.go().follow("users")).followAll("users");
    setUsers(await Promise.all(userResources.map(res => res.get())));
  }

  useEffect(() => { reload(); }, [courseUri, itemUri]);

  function onClickEdit(e) {
    setEditing(true);
  }

  async function onClickSave(e) {
    if (currentItem) {
      await client.go(currentItem.uri).put(currentItem);
    } else {
      await client.go(course.uri).put(course);
    }
    setEditing(false);
  }

  async function onClickDelete(e) {
    if (currentItem) {
      await client.go(currentItem.uri).delete();
      client.clearCache();
      navigate("/course", { state: { courseUri }, replace: true });
    } else {
      await client.go(course.uri).delete();
      client.clearCache();
      navigate("/", { replace: true });
    }
  }

  async function createNewItem(newItem) {
    const newItemResource = await client.go(course.links.get("items")).postFollow({ data: newItem });
    navigate("/course", { state: { courseUri, itemUri: newItemResource.uri } });
  }

  function onClickNewLecture(e) {
    createNewItem({
      itemType: "lecture",
      title: "New Lecture",
      content: "<h1 class=\"ql-align-center\">TODO</h1>\n"
    });
  }

  function onClickNewAssignment(e) {
    createNewItem({
      itemType: "assignment",
      title: "New Assignment",
      content: "<h1 class=\"ql-align-center\">TODO</h1>\n"
    });
  }

  function onChangeTitle(e) {
    if (currentItem) {
      currentItem.data.title = e.target.value;
    } else {
      course.data.title = e.target.value;
    }
  }

  function onChangeContent(newContent) {
    if (currentItem) {
      currentItem.data.content = newContent;
    } else {
      course.data.description = newContent;
    }
  }

  function onChangeDueDate(e) {
    currentItem.data.dueDate = e.target.value;
  }

  function onClickStudents(e) {
    navigate("/course/students", { state: { courseUri } });
  }

  function onClickGradebook(e) {
    navigate("/course/gradebook", { state: { courseUri } });
  }

  async function onClickRequestAccess(e) {
    const currentUserResource = await client.follow("users").follow("currentUser");
    await client.go(course.links.get("requests")).post({
      headers: { "Content-Type": "text/uri-list" },
      serializeBody: () => currentUserResource.uri + "\r\n"
    });
    setAccessRequested(true);
  }

  async function onClickSend(text) {
    await client.go(currentItem.uri + "/comments").post({ data: { text } });
    client.clearCache();
    reload();
  }

  async function onClickSubmitSolution(e) {
    const formData = new FormData();
    formData.append("file", e.target.file.files[0]);
    await client.go(currentItem.links.get("solutions")).post({
      headers: { "Content-Type": "multipart/form-data" },
      serializeBody: () => formData
    });
    client.clearCache();
    reload();
  }

  if (!course || !items || (itemUri && !currentItem) || !users ||
    (course.links.has("edit") && itemUri && currentItem.links.has("solutions") && !solutions) ||
    (itemUri && currentItem.links.has("my-solution") && !mySolution)) return <Info text="Loading..." />;

  const canEdit = course.links.has("edit");
  const canView = course.links.has("view");

  if (!canEdit && !canView) return (
    <SplitPane
      content={
        <Row className="justify-content-center">
          <Col md="4">
            <h3 className="text-center">Access Denied</h3>
            <Button variant="primary" size="sm w-100 mt-3" onClick={onClickRequestAccess} disabled={accessRequested}>
              Request Access
            </Button>
            {accessRequested && (
              <h5 className="text-center mt-2">OK!</h5>
            )}
          </Col>
        </Row>
      } />
  );

  return (
    <SplitPane
      sidebarLeft={
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/course"
            state={{ courseUri }}
            className="fst-italic text-reset text-center pt-2">
            {course.data.title}
          </Nav.Link>
          {items.map(item =>
            <Nav.Link as={Link} to="/course"
              state={{ courseUri, itemUri: item.uri }}
              style={sidebarLinkStyle}
              className={(item.uri === itemUri) ? "fw-bold" : ""}
              key={item.uri}>
              {item.data.title}
            </Nav.Link>
          )}
        </Nav>
      }
      content={
        <>
          {!editing && (
            <>
              <h3 className="text-center">{currentItem ? currentItem.data.title : course.data.title}</h3>
              {(currentItem && currentItem.links.has("solutions")) && (
                <p className="text-center text-danger">
                  due date: <span className="fw-bold">{currentItem.data.dueDate || "-"}</span>
                </p>
              )}
            </>
          )}
          {editing && (
            <Row className="mb-2">
              <Col>
                <Form.Control type="text" placeholder="Title"
                  defaultValue={currentItem ? currentItem.data.title : course.data.title}
                  onChange={onChangeTitle} />
              </Col>
              {(currentItem && currentItem.links.has("solutions")) && (
                <Col xs="3">
                  <Form.Control type="date"
                    defaultValue={currentItem.data.dueDate}
                    onChange={onChangeDueDate} />
                </Col>
              )}
            </Row>
          )}
          <ReactQuill
            readOnly={!editing}
            theme={editing ? "snow" : "bubble"}
            value={currentItem ? currentItem.data.content : course.data.description}
            onChange={onChangeContent}
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike"],
                [{ "header": "1" }, { "header": "2" }, "blockquote", "code-block"],
                [{ "list": "ordered" }, { "list": "bullet" }],
                ["link", "image", "video", "formula"],
                ["clean"]
              ]
            }} />
          {(!canEdit && currentItem && currentItem.links.has("solutions")) && (
            mySolution ? (
              <>
                <hr />
                <h5>My Solution</h5>
                <SolutionView solution={mySolution} users={users} />
              </>
            ) : (
              <>
                <hr />
                <h5>My Solution</h5>
                <Form onSubmit={(e) => { e.preventDefault(); onClickSubmitSolution(e); }}>
                  <Form.Control type="file" name="file" required />
                  <Button variant="outline-primary" size="sm" type="submit" className="mt-1">Submit</Button>
                </Form>
              </>
            )
          )}
          {solutions && (
            <>
              <hr />
              <h5>Solutions</h5>
              {solutions.map(solution => (
                <SolutionView solution={solution} users={users} key={solution.uri} editable="true" />
              ))}
            </>
          )}
          {(currentItem && currentItem.data.comments) && (
            <>
              <hr />
              <h5>Comments</h5>
              <div className="border border-2 rounded p-2 my-1">
                <Form onSubmit={(e) => { e.preventDefault(); onClickSend(e.target.text.value); }}>
                  <Form.Control as="textarea" rows={2} name="text" placeholder="Add a comment..." required />
                  <Button variant="outline-primary" size="sm" type="submit" className="mt-1">Send</Button>
                </Form>
              </div>
              {currentItem.data.comments.map((comment, index) => (
                <div className="border border-2 rounded p-2 my-1" key={currentItem.data.comments.length - index - 1}>
                  <Link to="/account" state={{ userUri: comment._links.user.href }} className="fw-bold text-decoration-none">
                    {users.find(user => user.uri === comment._links.user.href).data.fullName}
                  </Link>
                  <span className="text-muted float-end">{comment.createdAt}</span>
                  <hr className="my-1" />
                  {comment.text}
                </div>
              ))}
            </>
          )}
        </>
      }
      sidebarRight={
        <>
          <Calendar course={course} items={items} />
          {canEdit && (
            <>
              {!editing && (
                <Button variant="primary" size="sm w-100 mt-3" onClick={onClickEdit}>
                  Edit
                </Button>
              )}
              {editing && (
                <Button variant="success" size="sm w-100 mt-3" onClick={onClickSave}>
                  Save
                </Button>
              )}
              <Button variant="danger" size="sm w-100 mt-3" onClick={onClickDelete}>
                Delete
              </Button>
              <hr style={{ height: "2px" }} />
              <Button variant="outline-success" size="sm w-100" onClick={onClickNewLecture}>
                New Lecture
              </Button>
              <Button variant="outline-success" size="sm w-100 mt-3" onClick={onClickNewAssignment}>
                New Assignment
              </Button>
              <hr style={{ height: "2px" }} />
              <Button variant="secondary" size="sm w-100" onClick={onClickStudents}>
                Students
              </Button>
              <Button variant="secondary" size="sm w-100 mt-3" onClick={onClickGradebook}>
                Gradebook
              </Button>
            </>
          )}
        </>
      } />
  );
}

function Calendar(props) {
  const dateStyle = {
    display: "inline-block",
    width: "calc(100% / 7)",
    textAlign: "center"
  };

  const dates = [];

  const start = moment().startOf("month");
  const end = moment(start).add(1, "month");
  for (let m = moment(start); m.isBefore(end); m.add(1, "day")) {
    const date = m.format("YYYY-MM-DD");
    const dayOfWeek = (m.day() + 6) % 7;
    if (dayOfWeek === 0) {
      if (dates.length) {
        dates.push(<br key={date + "-br"} />);
      }
    } else if (!dates.length) {
      for (let x = 0; x < dayOfWeek; x++) {
        dates.push(<div key={date + "-xx-" + x} style={dateStyle} />)
      }
    }
    const item = props.items.find(item => item.data.dueDate === date);
    if (item) {
      dates.push(
        <OverlayTrigger key={date} overlay={<Tooltip>{item.data.title}</Tooltip>}>
          <div style={dateStyle} className="bg-danger text-white rounded">
            <Link to="/course" state={{ courseUri: props.course.uri, itemUri: item.uri }}
              className="text-reset"
            >
              {m.date().toString().padStart(2, "0")}
            </Link>
          </div>
        </OverlayTrigger>
      );
    } else {
      dates.push(
        <div style={dateStyle} key={date}>
          {m.date().toString().padStart(2, "0")}
        </div>
      );
    }
  }

  return (
    <div className="border border-2 rounded mt-3 p-1">
      {dates}
    </div>
  );
}

function Gradebook(props) {
  const location = useLocation();
  const navigate = useNavigate();

  const { courseUri } = location.state;

  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState(null);

  async function reload() {
    setCourse(null);
    setGrades(null);

    const course = await client.go(courseUri).get();
    setCourse(course);

    const grades = await client.go(courseUri + "/grades").get();
    setGrades(grades);
  }

  useEffect(() => { reload(); }, [courseUri]);

  function onClickBack(e) {
    navigate("/course", { state: { courseUri } });
  }

  if (!course || !grades) return <Info text="Loading..." />

  return (
    <SplitPane
      sidebarLeft={
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/course"
            state={{ courseUri }}
            className="fst-italic text-reset text-center pt-2">
            {course.data.title}
          </Nav.Link>
        </Nav>
      }
      content={
        <Table striped>
          <thead>
            <tr>
              <th>Student</th>
              {grades.data.assignments.map((assignment, index) => (
                <th key={index}>{assignment}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.data.students.map((student, index1) => (
              <tr key={index1}>
                <td>{student.fullName}</td>
                {student.grades.map((grade, index2) => (
                  <td key={index2}>{grade !== null ? grade : "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      }
      sidebarRight={
        <Button variant="primary" size="sm w-100 mt-3" onClick={onClickBack}>
          Back
        </Button>
      } />
  );
}

function SolutionView(props) {
  const [grade, setGrade] = useState(props.solution.data.grade);

  async function onClickSaveGrade() {
    props.solution.data.grade = parseInt(grade);
    client.go(props.solution.uri).put(props.solution);
  }

  return (
    <div className="border border-2 rounded p-2 my-1">
      {props.editable && (
        <h6>
          <Link to="/account" state={{ userUri: props.solution.links.get("student").href }} className="text-decoration-none">
            {props.users.find(user => user.uri === props.solution.links.get("student").href).data.fullName}
          </Link>
        </h6>
      )}
      {!props.editable && (
        <h6>GRADE: {props.solution.data.grade !== null ? props.solution.data.grade : "-"}</h6>
      )}
      {props.editable && (
        <h6>
          GRADE:
          <Form.Control type="text" defaultValue={props.solution.data.grade} onChange={(e) => setGrade(e.target.value)} className="mt-1" style={{ "width": "60px" }} />
        </h6>
      )}
      <a href={props.solution.links.get("download").href}>Download</a> {props.editable && (
        <a href="#" onClick={(e) => { e.preventDefault(); onClickSaveGrade(); }}>Save Grade</a>
      )}
    </div>
  );
}

function StudentsAndRequests() {
  const location = useLocation();
  const navigate = useNavigate();

  const { courseUri } = location.state;

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState(null);
  const [requests, setRequests] = useState(null);

  async function reload() {
    setCourse(null);
    setStudents(null);
    setRequests(null);

    const course = await client.go(courseUri).get();
    setCourse(course);

    const studentResources = await course.follow("students").followAll("users");
    setStudents(await Promise.all(studentResources.map(res => res.get())));

    const requestResources = await course.follow("requests").followAll("users");
    setRequests(await Promise.all(requestResources.map(res => res.get())));
  }

  useEffect(() => { reload(); }, [courseUri]);

  function onClickBack(e) {
    navigate("/course", { state: { courseUri } });
  }

  async function onClickRemove(studentUriToRemove) {
    const newStudentUris = students
      .map(student => student.uri)
      .filter(uri => uri != studentUriToRemove)
      .map(uri => uri + "\r\n")
      .join("");
    await client.go(course.links.get("students")).put({
      headers: { "Content-Type": "text/uri-list" },
      serializeBody: () => newStudentUris
    });
    reload();
  }

  async function onClickAccept(studentUriToAccept) {
    const newStudentUris = students
      .map(student => student.uri)
      .concat(studentUriToAccept)
      .map(uri => uri + "\r\n")
      .join("");
    const newRequestUris = requests
      .map(student => student.uri)
      .filter(uri => uri != studentUriToAccept)
      .map(uri => uri + "\r\n")
      .join("");
    await client.go(course.links.get("students")).put({
      headers: { "Content-Type": "text/uri-list" },
      serializeBody: () => newStudentUris
    });
    await client.go(course.links.get("requests")).put({
      headers: { "Content-Type": "text/uri-list" },
      serializeBody: () => newRequestUris
    });
    reload();
  }

  async function onClickDeny(studentUriToDeny) {
    const newRequestUris = requests
      .map(student => student.uri)
      .filter(uri => uri != studentUriToDeny)
      .map(uri => uri + "\r\n")
      .join("");
    await client.go(course.links.get("requests")).put({
      headers: { "Content-Type": "text/uri-list" },
      serializeBody: () => newRequestUris
    });
    reload();
  }

  if (!course || !students || !requests) return <Info text="Loading..." />

  return (
    <SplitPane
      sidebarLeft={
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/course"
            state={{ courseUri }}
            className="fst-italic text-reset text-center pt-2">
            {course.data.title}
          </Nav.Link>
        </Nav>
      }
      content={
        <>
          <h5>Students</h5>
          <Table striped>
            <tbody>
              {students
                .map(student =>
                  <tr key={student.uri}>
                    <td>
                      <Link to="/account" state={{ userUri: student.uri }} className="text-decoration-none">
                        {student.data.fullName}
                      </Link>
                    </td>
                    <td style={{ width: "100px" }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); onClickRemove(student.uri); }}>Remove</a>
                    </td>
                  </tr>
                )}
            </tbody>
          </Table>
          <h5>Requests</h5>
          <Table striped>
            <tbody>
              {requests
                .map(student =>
                  <tr key={student.uri}>
                    <td>
                      <Link to="/account" state={{ userUri: student.uri }} className="text-decoration-none">
                        {student.data.fullName}
                      </Link>
                    </td>
                    <td style={{ width: "100px" }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); onClickAccept(student.uri); }}>Accept</a>
                    </td>
                    <td style={{ width: "100px" }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); onClickDeny(student.uri); }}>Deny</a>
                    </td>
                  </tr>
                )}
            </tbody>
          </Table>
        </>
      }
      sidebarRight={
        <Button variant="primary" size="sm w-100 mt-3" onClick={onClickBack}>
          Back
        </Button>
      } />
  );
}

function Info(props) {
  return (
    <SplitPane
      content={
        <h3 className="text-center text-muted">{props.text}</h3>
      } />
  );
}

function SplitPane(props) {
  return (
    <Container fluid>
      <Row>
        {props.sidebarLeft && (
          <Col xl="2" md="3" style={{
            position: "sticky",
            top: "3.5rem",
            minHeight: "calc(100vh - 3.5rem)",
            backgroundColor: "#f7f7f7",
            borderRight: "1px solid #ececec"
          }}>
            {props.sidebarLeft}
          </Col>
        )}
        <Col className="pt-2">
          {props.content}
        </Col>
        {props.sidebarRight && (
          <Col xl="2" md="3" style={{
            position: "sticky",
            top: "3.5rem",
            minHeight: "calc(100vh - 3.5rem)",
            backgroundColor: "#f7f7f7",
            borderRight: "1px solid #ececec"
          }}>
            {props.sidebarRight}
          </Col>
        )}
      </Row>
    </Container>
  );
}

async function isAuthenticated(creds) {
  try {
    await client.go().refresh(creds && {
      headers: {
        "Authorization": "Basic " + window.btoa(creds.username + ":" + creds.password)
      }
    });
    return true;
  } catch (e) {
    return false;
  }
}

function doRegister(fullName, username, password, email) {
  client.go("/users").post({ data: { fullName, username, password, email } });
}

function doLogout() {
  client.go("/logout").post();
  client.clearCache();
}

const sidebarLinkStyle = {
  textDecoration: "none",
  color: "rgba(26,26,26,.75)"
};

export default App;
