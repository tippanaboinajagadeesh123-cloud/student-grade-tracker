import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      switch (Text.compare(student1.name, student2.name)) {
        case (#equal) { Text.compare(student1.className, student2.className) };
        case (order) { order };
      };
    };

    public func compareByClass(student1 : Student, student2 : Student) : Order.Order {
      switch (Text.compare(student1.className, student2.className)) {
        case (#equal) { Text.compare(student1.name, student2.name) };
        case (order) { order };
      };
    };
  };

  module ParentChildRelation {
    public func compare(relation1 : ParentChildRelation, relation2 : ParentChildRelation) : Order.Order {
      Nat.compare(relation1.studentId, relation2.studentId);
    };
  };

  type Student = {
    id : Nat;
    name : Text;
    className : Text;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  type Grade = {
    id : Nat;
    studentId : Nat;
    subject : Text;
    score : Nat;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  type ParentChildRelation = {
    parent : Principal;
    studentId : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextStudentId = 1;
  var nextGradeId = 1;

  let students = Map.empty<Nat, Student>();
  let grades = Map.empty<Nat, Grade>();
  let parentChildRelations = Map.empty<Principal, List.List<ParentChildRelation>>();

  // Helper function to check if a parent has access to a student
  func parentHasAccessToStudent(parent : Principal, studentId : Nat) : Bool {
    switch (parentChildRelations.get(parent)) {
      case (?relations) {
        relations.any(func(relation) { relation.studentId == studentId })
      };
      case (null) { false };
    };
  };

  // Helper function to get student IDs for a parent
  func getStudentIdsForParent(parent : Principal) : [Nat] {
    switch (parentChildRelations.get(parent)) {
      case (?relations) {
        relations.toArray().map(func(relation) { relation.studentId })
      };
      case (null) { [] };
    };
  };

  // Student Management
  public shared ({ caller }) func addStudent(name : Text, className : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add students");
    };
    let studentId = nextStudentId;
    nextStudentId += 1;

    let student : Student = {
      id = studentId;
      name;
      className;
      createdBy = caller;
      createdAt = Time.now();
    };

    students.add(studentId, student);
    studentId;
  };

  public shared ({ caller }) func updateStudent(id : Nat, name : Text, className : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can update students");
    };

    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };

    let existingStudent = switch (students.get(id)) {
      case (?student) { student };
      case (null) { Runtime.trap("Student not found") };
    };

    let updatedStudent : Student = {
      existingStudent with name;
      className;
    };

    students.add(id, updatedStudent);
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can delete students");
    };
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };

    students.remove(id);
  };

  public query ({ caller }) func getStudent(id : Nat) : async Student {
    // Teachers can view any student, parents can only view their child
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Teacher access - allow all
      switch (students.get(id)) {
        case (?student) { student };
        case (null) { Runtime.trap("Student not found") };
      };
    } else if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      // Parent access - check if this is their child
      if (not parentHasAccessToStudent(caller, id)) {
        Runtime.trap("Unauthorized: Parents can only view their own child's information");
      };
      switch (students.get(id)) {
        case (?student) { student };
        case (null) { Runtime.trap("Student not found") };
      };
    } else {
      Runtime.trap("Unauthorized: Authentication required");
    };
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    // Only teachers can view all students
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all students");
    };
    students.values().toArray().sort();
  };

  public query ({ caller }) func getAllStudentsByClass() : async [Student] {
    // Only teachers can view all students
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all students");
    };
    students.values().toArray().sort(Student.compareByClass);
  };

  public query ({ caller }) func searchStudents(searchText : Text) : async [Student] {
    // Only teachers can search all students
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can search students");
    };
    let resultsIter = students.values().filter(
      func(student) {
        student.name.contains(#text searchText) or student.className.contains(#text searchText)
      }
    );
    resultsIter.toArray();
  };

  // Grade Management
  public shared ({ caller }) func addGrade(studentId : Nat, subject : Text, score : Nat) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can add grades");
    };

    if (not students.containsKey(studentId)) {
      Runtime.trap("Student not found");
    };

    let gradeId = nextGradeId;
    nextGradeId += 1;

    let grade : Grade = {
      id = gradeId;
      studentId;
      subject;
      score;
      createdBy = caller;
      createdAt = Time.now();
    };

    grades.add(gradeId, grade);
    gradeId;
  };

  public shared ({ caller }) func updateGrade(id : Nat, studentId : Nat, subject : Text, score : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can update grades");
    };

    if (not grades.containsKey(id)) {
      Runtime.trap("Grade not found");
    };

    let existingGrade = switch (grades.get(id)) {
      case (?grade) { grade };
      case (null) { Runtime.trap("Grade not found") };
    };

    let updatedGrade : Grade = {
      existingGrade with studentId;
      subject;
      score;
    };

    grades.add(id, updatedGrade);
  };

  public shared ({ caller }) func deleteGrade(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can delete grades");
    };

    if (not grades.containsKey(id)) {
      Runtime.trap("Grade not found");
    };

    grades.remove(id);
  };

  public query ({ caller }) func getGradesForStudent(studentId : Nat) : async [Grade] {
    // Teachers can view any student's grades, parents can only view their child's grades
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Teacher access - allow all
      let gradesIter = grades.values().filter(
        func(grade) { grade.studentId == studentId }
      );
      gradesIter.toArray();
    } else if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      // Parent access - check if this is their child
      if (not parentHasAccessToStudent(caller, studentId)) {
        Runtime.trap("Unauthorized: Parents can only view their own child's grades");
      };
      let gradesIter = grades.values().filter(
        func(grade) { grade.studentId == studentId }
      );
      gradesIter.toArray();
    } else {
      Runtime.trap("Unauthorized: Authentication required");
    };
  };

  public query ({ caller }) func getAllGrades() : async [Grade] {
    // Only teachers can view all grades
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can view all grades");
    };
    grades.values().toArray();
  };

  // Parent-Child Relationships
  public shared ({ caller }) func linkParentToStudent(parent : Principal, studentId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only teachers can link parents to students");
    };

    if (not students.containsKey(studentId)) {
      Runtime.trap("Student not found");
    };

    let relation : ParentChildRelation = {
      parent;
      studentId;
    };

    let existingRelations = switch (parentChildRelations.get(parent)) {
      case (?relations) { relations };
      case (null) {
        let newRelations = List.empty<ParentChildRelation>();
        parentChildRelations.add(parent, newRelations);
        newRelations;
      };
    };

    existingRelations.add(relation);
  };

  public query ({ caller }) func getChildForParent() : async Student {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only parents can access this");
    };

    switch (parentChildRelations.get(caller)) {
      case (?relations) {
        let relation = relations.at(0);
        switch (students.get(relation.studentId)) {
          case (?student) { student };
          case (null) { Runtime.trap("Student not found") };
        };
      };
      case (null) { Runtime.trap("The parent has no children") };
    };
  };

  public query ({ caller }) func getGradesForParentChild() : async [Grade] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only parents can access this");
    };

    switch (parentChildRelations.get(caller)) {
      case (?relations) {
        let relation = relations.at(0);
        let gradesIter = grades.values().filter(
          func(grade) { grade.studentId == relation.studentId }
        );
        gradesIter.toArray();
      };
      case (null) { Runtime.trap("The parent has no children") };
    };
  };

  public query ({ caller }) func getStudentDataIfAuthorized(studentId : Nat) : async Student {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Teacher access - allow all
      switch (students.get(studentId)) {
        case (?student) { student };
        case (null) { Runtime.trap("Student not found") };
      };
    } else if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      // Parent access - check if this is their child
      if (not parentHasAccessToStudent(caller, studentId)) {
        Runtime.trap("Unauthorized: Parents can only view their own child's information");
      };
      switch (students.get(studentId)) {
        case (?student) { student };
        case (null) { Runtime.trap("Student not found") };
      };
    } else {
      Runtime.trap("Unauthorized: Authentication required");
    };
  };
};
