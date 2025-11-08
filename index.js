const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

let students = [
  {
    id: "1",
    name: "Ahmed Hassan",
    email: "ahmed@iti.edu",
    age: 22,
    major: "Computer Science",
  },
  {
    id: "2",
    name: "Fatma Ali",
    email: "fatma@iti.edu",
    age: 21,
    major: "Information Systems",
  },
];

let courses = [
  {
    id: "1",
    title: "Data Structures",
    code: "CS201",
    credits: 3,
    instructor: "Dr. Mohamed",
  },
  {
    id: "2",
    title: "Database Systems",
    code: "CS301",
    credits: 4,
    instructor: "Dr. Sarah",
  },
];

let enrollments = {
  1: ["1", "2"], 
  2: ["2"], 
};

const typeDefs = gql`
  type Student {
    id: ID!
    name: String!
    email: String!
    age: Int!
    major: String!
    courses: [Course!]!
  }

  type Course {
    id: ID!
    title: String!
    code: String!
    credits: Int!
    instructor: String!
    students: [Student!]!
  }

  type Query {
    getAllStudents: [Student!]!
    getStudent(id: ID!): Student
    getAllCourses: [Course!]!
    getCourse(id: ID!): Course
    searchStudentsByMajor(major: String!): [Student!]!
  }

  type Mutation {
    addStudent(
      name: String!
      email: String!
      age: Int!
      major: String!
    ): Student
    updateStudent(
      id: ID!
      name: String!
      email: String!
      age: Int!
      major: String!
    ): Student
    deleteStudent(id: ID!): Student
    addCourse(
      title: String!
      code: String!
      credits: Int!
      instructor: String!
    ): Course
    updateCourse(
      id: ID!
      title: String!
      code: String!
      credits: Int!
      instructor: String!
    ): Course
    deleteCourse(id: ID!): Course
  }
`;

const resolvers = {
  Query: {
    getAllStudents: () => students,
    getStudent: (_, inputs) =>
      students.find((student) => student.id === inputs.id),
    getAllCourses: () => courses,
    getCourse: (_, inputs) => courses.find((course) => course.id === inputs.id),
    searchStudentsByMajor: (_, inputs) =>
      students.filter((student) => student.major === inputs.major),
  },

  Mutation: {
    addStudent: (_, { name, email, age, major }) => {
      const newStudent = {
        id: String(students.length + 1),
        name,
        email,
        age,
        major,
      };
      students.push(newStudent);
      enrollments[newStudent.id] = [];
      return newStudent;
    },

    updateStudent: (_, { id, name, email, age, major }) => {
      const student = students.find((s) => s.id === id);
      if (!student) throw new Error("Student not found");
      student.name = name;
      student.email = email;
      student.age = age;
      student.major = major;
      return student;
    },

    deleteStudent: (_, { id }) => {
      const student = students.find((s) => s.id === id);
      students = students.filter((s) => s.id !== id);
      delete enrollments[id];
      return student;
    },

    addCourse: (_, { title, code, credits, instructor }) => {
      const newCourse = {
        id: String(courses.length + 1),
        title,
        code,
        credits,
        instructor,
      };
      courses.push(newCourse);
      return newCourse;
    },

    updateCourse: (_, { id, title, code, credits, instructor }) => {
      const course = courses.find((c) => c.id === id);
      if (!course) throw new Error("Course not found");
      course.title = title;
      course.code = code;
      course.credits = credits;
      course.instructor = instructor;
      return course;
    },

    deleteCourse: (_, { id }) => {
      const course = courses.find((c) => c.id === id);
      courses = courses.filter((c) => c.id !== id);
      return course;
    },
  },

  Student: {
    courses: (parent) => {
      const courseIds = enrollments[parent.id] || [];
      return courses.filter((c) => courseIds.includes(c.id));
    },
  },

  Course: {
    students: (parent) => {
      const enrolledStudents = Object.keys(enrollments)
        .filter((studentId) => enrollments[studentId].includes(parent.id))
        .map((studentId) => students.find((s) => s.id === studentId));
      return enrolledStudents;
    },
  },
};

async function start() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  app.listen(5000, () =>
    console.log(`Server ready at http://localhost:5000/graphql`)
  );
}

start();
