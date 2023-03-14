module.exports.schema = [
  {
    name: "updatedAt",
    mode: "NULLABLE",
    type: "TIMESTAMP",
    description: null,
  },
  {
    name: "createdAt",
    mode: "NULLABLE",
    type: "TIMESTAMP",
    description: null,
  },
  {
    name: "familyName",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "status",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "assignedLocations",
    mode: "NULLABLE",
    type: "RECORD",
    description: null,
    fields: [
      {
        name: "locationIds",
        mode: "REPEATED",
        type: "STRING",
        description: null,
        fields: [],
      },
      {
        name: "assignmentType",
        mode: "NULLABLE",
        type: "STRING",
        description: null,
        fields: [],
      },
    ],
  },
  {
    name: "id",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "referenceId",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "phoneNumber",
    mode: "NULLABLE",
    type: "INTEGER",
    description: null,
  },
  {
    name: "givenName",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "emailAddress",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "isOwner",
    mode: "NULLABLE",
    type: "BOOLEAN",
    description: null,
  },
];
