module.exports.schema = [
  {
    name: "creationSource",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "preferences",
    mode: "NULLABLE",
    type: "RECORD",
    description: null,
    fields: [
      {
        name: "emailUnsubscribed",
        mode: "NULLABLE",
        type: "BOOLEAN",
        description: null,
        fields: [],
      },
    ],
  },
  {
    name: "familyName",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
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
    name: "segmentIds",
    mode: "REPEATED",
    type: "STRING",
    description: null,
  },
  {
    name: "givenName",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "id",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "version",
    mode: "NULLABLE",
    type: "INTEGER",
    description: null,
  },
  {
    name: "phoneNumber",
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
    name: "companyName",
    mode: "NULLABLE",
    type: "STRING",
    description: null,
  },
  {
    name: "groupIds",
    mode: "REPEATED",
    type: "STRING",
    description: null,
  },
];
