let specification = {
  name: "create_member",
  description:
    "This function will create a member and it will need the following data fields memberId, firstName, LastName and email field",
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
    },
    required: ["memberId", "firstName", "lastName", "email"],
  },
};

export default specification;
