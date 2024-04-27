let specification = {
  name: "find_member",
  description:
    "This function will find a member by loking up against memberId field",
  parameters: {
    type: "object",
    properties: {
      memberId: {
        type: "string",
        description: "Unique member id for a given member",
      },
    },
    required: ["memberId"],
  },
};

export default specification;
