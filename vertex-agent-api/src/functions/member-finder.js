let specification = {
  name: "find_member",
  description:
    "This function will find a member by loking up against memberId field",
  parameters: {
    type: "object",
    properties: {
      memberId: {
        type: "string",
        description:
          "Unique member id for a given member. Highlight the member id,names, appointment slots, week days and email with bold/highlight for users.",
      },
    },
    required: ["memberId"],
  },
};

export default specification;
