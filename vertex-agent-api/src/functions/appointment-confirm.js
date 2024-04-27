let specification = {
  name: "create_appointment",
  description:
    "This function will create new appointment and it will need the following data fields memberId, firstName, LastName, email and appointmentId field",
  parameters: {
    type: "object",
    properties: {
      memberId: {
        type: "string",
        description: "Unique member id for a given member or user",
      },
      firstName: {
        type: "string",
        description: "First name for a given given member or user",
      },
      lastName: {
        type: "string",
        description: "Last name for a given user or member",
      },
      email: {
        type: "string",
        description: "email of the user or member",
      },
      appointmentId: {
        type: "string",
        description: "Unique appointment id of the open slot",
      },
    },
    required: ["memberId", "firstName", "lastName", "email", "appointmentId"],
  },
};

export default specification;
