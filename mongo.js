const mongoose = require("mongoose");

if (process.argv < 3) {
  console.log(
    "Please enter your password in the console when you run node mongo.js"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Lucas2814:${password}@cluster0.nxfm7qq.mongodb.net/PhonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((response) => {
    console.log("Connected with MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv[2] && !process.argv[3] && !process.argv[4]) {
  Person.find({}).then((persons) => {
    console.log("Phonebook:");
    persons.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else {
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  newPerson.save().then((result) => {
    console.log(`Added ${newPerson.name} ${newPerson.number} to phonebook`);
    mongoose.connection.close();
  });
}
