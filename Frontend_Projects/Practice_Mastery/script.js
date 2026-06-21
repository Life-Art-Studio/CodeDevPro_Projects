// const arr1 = [1, 2, 3];
// const arr2 = arr1;

// arr2.push(4);

// console.log(arr1.length);

// let a = 10;
// let b = a;

// b = 20;
// console.log(a);
// console.log(b);

// let obj1 = { name: "Alex" };
// let obj2 = obj1;

// obj2 = { name: "John" };
// console.log(obj1.name);
// console.log(obj2.name);

// const settings = {
//   theme: { dark: false }
// };

// const copy = settings;
// copy.theme = { dark: true };
// console.log(settings.theme.dark);

// const user = {
//   name: "Sara",
//   skills: ["JS", "React"]
// };

// const clone = { ...user };
// clone.skills.push("Node");
// console.log(user.skills);

// function update(obj) {
//   obj.status = "active";
// }

// const account = { status: "inactive" };
// update(account);
// console.log(account.status);

// const x = { value: 1 };
// const y = { value: 1 };

// console.log(x === y);

// const data = { count: 1 };
// data.count = 2;
// console.log(data.count);

// let value = "false";

// if (value) {
//   console.log("True");
// } else {
//   console.log("False");
// }
// let input = "0";

// if (input) {
//   console.log("Valid");
// } else {
//   console.log("Invalid");
// }
// let x = NaN;

// if (x === NaN) {
//   console.log("Equal");
// } else {
//   console.log("Not Equal");
// }

// if ([]) {
//   console.log("Yes");
// } else {
//   console.log("No");
// }

// console.log(parseInt("1px") === 1);
// console.log(Number("1px") === 1);

// console.log(null == undefined);
// console.log(null === undefined);

// console.log({} == {});

// console.log(1 && "Hello" && 0 && "World");
// console.log(1 || "Hello" || 0 || "World");

// let name = "";
// name = name || "Guest";

// console.log(name);
// console.log([] + []);
// console.log([] + {});
// console.log({} + []);

// const sys =null;
// console.log(sys && sys.id);

// const callback=()=>{
//    return "callback";
// };
//  console.log(callback && callback());

// const input = 1;

// let result =input || 10;
// console.log(result);
// console.log(true && false && console.log("Hello"));

// const config ={};
// console.log(config && config.theme );

// console.log("JS" && 0 && "Fun");

// const value = "";
// console.log(value || "Default");
// console.log(value && "Default");

// const data = { items: null };

// // Log data.items[0] safely using && only
// console.log(data.items && data.items[0]);

// let stock
// stock = stock ? "available" : "out of stock";
// console.log(stock);

// const score =0;
// let finalScore=score ?? 10;
// console.log(finalScore);

// const points = "";
// const result = points ?? 50;
// console.log(result);

// const points = "";
// const result = points || 50;
// console.log(result);
// const isActive = false;
// const status = isActive ?? true;
// console.log(status);

// const user = null;

// const name = user?.name ?? "Guest";
// console.log(name);

// const config = { mode: null };

// const mode =( config.mode && "dark") ?? "light";
// console.log(mode);

// const value = undefined;

// const result = value ?? null ?? "Default";
// console.log(result);

// function log(score) {
//   const final = score ?? 10;
//   console.log(final);
// }

// log(0);

// const data = { score: 0 };

// const result = (data.score || data.score) ?? 100;
// console.log(result);

// const logs=["error", "warning", "info"];

// for(let i=logs.length-1;i>=0;i--){
//     console.log(logs[i]);
// }

// const arr = [1, 2, 3, 4];
// for (let i=arr.length-1;i>=0;i--){
//     console.log(arr[i]);
// }
// const nums = [10, 20, 30, 40, 50];
// for (let i=0;i<=nums.length-1;i=i+2){
//     console.log(nums[i]);
// }

// const steps = ["Init", "Load", "Error", "Retry"];

// for(let i=0;i<=steps.length-1;i++){
//     console.log(steps[i]);
//     if(steps[i]==="Error"){
//         break;
//     }
// }
// const users = ["Alex", "Sam", "John", "Sam"];
// for(let i=0;i<=users.length-1;i++){
//     if(users[i]==="Sam"){
//         console.log(i);
//         break;
//     }
// }
// const str = "JavaScript";

// let reverse ="";
// for (let i = str.length-1;i>=0;i--){
//     reverse += str[i];
// }
// console.log(reverse);

// for(let i=10;i>=1;i--){

//     if(i%3 === 0){
//         continue;
//     }
//     console.log(i);
// }

// for (let i = 0; i < 2; i++) {
//   for (let j = 0; j < 2; j++) {
//     console.log(i, j);
//   }
// }

// let count =5;
// while(count>0){
//     console.log(count);
//     count--;
// }

// const items= ["Apple", "Banana", "Orange"];
// while (items.length>0){
//     console.log(items.pop());
// }

// const data = [1, 2, 3];

// // Task: Print ALL elements WITHOUT accessing undefined

// for(let i=0;i<data.length;i++){
//     console.log(data[i]);
// }

// for(let i=data.length-1;i>=0;i--){
//     console.log(data[i]);
// }

// let  num =0;
// while (num!==5){
//     num= Math.floor(Math.random()*10);
//     console.log(num);
// }

// let num = 0;
// let attempts = 0;

// while (num !== 5 && attempts < 10) {
//   num = Math.floor(Math.random() * 10);
//   console.log(num);
//   attempts++;
// }

// let n = 1;

// while (n) {
//   console.log(n);
//   n--;
// }

// console.log(Math.floor(Math.random() * 5));
// let x = 5;

// while (x > 0) {
//   console.log(x);
//   x += 1;
// }
// let value = 0;

// do {
//   console.log(value);
//   value++;
// } while (value < 0);
// while (true) {
//   let r = Math.floor(Math.random() * 3);
//   console.log(r);
//   if (r === 2) break;
// }
// console.log(Math.floor(Math.random() * 10) + 1);
// for (let i = 0; i < 3; i++) {
//   let r = Math.floor(Math.random() * 2);
//   console.log(i, r);
// }
// let num1=0;
// let num2;
// while(num1 !== 6 || num2 !== 6){
//     num1=Math.floor(Math.random()*10);
//     num2=Math.floor(Math.random()*10);
//     console.log(num1,num2);
//     if(num1 === 6 && num2 === 6){
//         console.log("Equal");
//     }
// }

// let count = 0;

// while (count < 3) {
//   console.log(count++);
// }

// let num = 0;

// while (num !== 5) {
//   num = Math.floor(Math.random() * 5)+1;
//   console.log(num);
// }

// const cube = [
//   [[1], [2]],
//   [[3], [4]],
// ];
// const flat = [];
// for (let row of cube) {
//   for (let col of row) {
//     for (let num of col) {
//       flat.push(num);
//     }
//   }
// }
// console.log(flat);

// const ids = [1, 2, "BAD", 4, 5];

// for (let id of ids) {
//     if(id === "BAD"){
//         continue;
//     }
//     if(id === 4){
//         break;
//     }
//     console.log(id);
// }

// const nums = [2,3, 4,5, 6, 7, 8,9, 10];

// for(let num of nums){
//     if(num%2===0){
//         continue;
//     }
//     if(num===7){
//         break;
//     }
//     console.log(num);
// }
// const words = ["ok", "", "valid", " ", "done"];
// for (let word of words){
//     if(word === " " || word === ""){
//         continue
//     }
//     if(word  === "done"){
//         break;
//     }
//     console.log(word);
// }\

// const data = [10, 20, 30, 40, 50];

// for(let i of data){
//     if(data.indexOf(i) === 1){
//         continue;
//     }
//     if(data.indexOf (i) === 3){
//         break;
//     }
//     console.log(i);
// }

// const matrix = [
//   [1, 2],
//   [3, 4],
//   [5, 6]
// ];

// for (let i =0 ;i <matrix.length;i++){
//     for (let j =0 ;j <matrix[i].length;j++){
//         if(matrix[i][j] === 4){
//             console.log(matrix[i][j]);
//             break;
//         }

//     }
// }
// for (let i = 0; i < 10; i++) {
//   const num = Math.floor(Math.random() * 10);

//   if (num <= 3) {
//     continue;
//   }
//   if (num >= 7) {
//     break;
//   }
//   console.log(num);
// }

// const inputs = ["A", "", "B", null, "C"];
// let count=[]
// for(let input of inputs){
//     if(input === "" || input === null){
//         continue;
//     }
//     count.push(input);
//     if(count.length === 2){
//         break;
//     }
// }
// console.log(count);

// const nums = [1, 2, 3, 4, 5];
// for (let i = nums.length-1; i >= 0; i--) {
//   if(i===3){
//     continue;
//   }
//   console.log(nums[i]);
//   if(i===1){
//     break;
//   }
// }
// const grid = [
//   [1, 2, 3],
//   [4, 5, 6]
// ];
// for (let i = 0; i < grid.length; i++) {
// //   console.log(grid[i]);
//   for(let j=0;j<grid[i].length;j++){
//     // console.log(grid[i][j]);
//     if(grid[i][j] === 5){
//         break;
//     }
//     console.log(grid[i][j]);
//   }

// }
// let arrOfFizzBuzz = [];
// for(let i=1;i<=100;i++)
// {
// if(i%3===0 && i%5===0){
//     arrOfFizzBuzz.push("FizzBuzz");
// }
// else if(i%3===0){
//     arrOfFizzBuzz.push("Fizz");
// }
// else if(i%5===0){
//     arrOfFizzBuzz.push("Buzz");
// }
// else{
//     arrOfFizzBuzz.push(i);
// }
// }
// console.log(arrOfFizzBuzz);

// const resultFizzBuzz = arrOfFizzBuzz.filter(item=>item==="FizzBuzz");
// console.log(resultFizzBuzz.length);

// const resultFizz = arrOfFizzBuzz.filter(item=>item==="Fizz");
// console.log(resultFizz.length);

// const resultBuzz = arrOfFizzBuzz.filter(item=>item==="Buzz");
// console.log(resultBuzz.length);

// function fizzBuzz(start,end ){
//     let arrOfFizzBuzz = [];
// for(let i=start;i<=end;i++)
// {
// if(i%3===0 && i%5===0){
//     arrOfFizzBuzz.push("FizzBuzz");
// }
// else if(i%3===0){
//     arrOfFizzBuzz.push("Fizz");
// }
// else if(i%5===0){
//     arrOfFizzBuzz.push("Buzz");
// }
// else{
//     arrOfFizzBuzz.push(i);
// }
// }
// console.log(arrOfFizzBuzz);

// const resultFizzBuzz = arrOfFizzBuzz.filter(item=>item==="FizzBuzz");
// console.log(resultFizzBuzz.length);

// const resultFizz = arrOfFizzBuzz.filter(item=>item==="Fizz");
// console.log(resultFizz.length);

// const resultBuzz = arrOfFizzBuzz.filter(item=>item==="Buzz");
// console.log(resultBuzz.length);

// }
// fizzBuzz(1,10);

// const rules = {
//   3: "Fizz",
//   5: "Buzz",
//   7: "Pop",
// };

// function fizzBuzz(start, end) {
//   let arrOfFizzBuzz = [];
//   for (let i = start; i <= end; i++) {
//     if (i % 3 === 0 && i % 5 === 0) {
//       rules[i] = "FizzBuzz";
//     } else if (i % 3 === 0) {
//       rules[i] = "Fizz";
//     } else if (i % 5 === 0) {
//       rules[i] = "Buzz";
//     } else {
//       rules[i] = i;
//     }
//   }
//   console.log(rules);
// }
// fizzBuzz(1, 10);

// const user = { name: "Adil", role: "Admin" };
// const propToFind = "role";

// console.log(user[propToFind]);

// const settings = { theme: "light" };
// const key = "theme";

// // Task: Change theme to "dark" using key

// settings[key] = "dark";
// console.log(settings);

// const obj={}
// const prop ="status"
 
// obj[prop] = "active";
// console.log(obj);

// const user ={ name: "Sara"}
// const key="email"
// if(key in user){
//     console.log(true);
// }
// else{
//     console.log(false);
// }

// const products={ id:1,price:99,stock:5}
// for (let key in products){
//     console.log(products[key]);
// }

// const data = {
//   profile: {
//     username: "adil123"
//   }
// };

// const keys = ["profile", "username"];

// console.log(data[keys[0]][keys[1]]);

// const user = { name: "Alex", age: 25 };

// // user.years=user.age;
// // delete user.age;
// // console.log(user);

// const {age,...rest}=user;
// const user2={...rest,years:25}
// console.log(user2);

// const session = { token: "abc", expires: true };
// const key = "token";

// delete session[key];
// console.log(session);

// const config = {};
// console.log(config.mode || "default");


// const permissions = {
//   Admin: true,
//   Editor: false,
//   Viewer: true
// };

// const role = "Editor";

// console.log(permissions[role]);

// const data = { id: 1, meta: { counts: 5} };
// const{meta:{counts},...rest}=data;
 
// const newQty={...rest,meta:{qty:5}};
// console.log(newQty);
// const { meta: { counts: qty } } = data;
// console.log(qty);

// const user = { name: "Adil", age: 22 };

// const{age:years}=user;
// console.log(years);

// const config = {
//   server: {
//     port: 8080
//   }
// };

// const { server: { port: p } } = config;
// console.log(p);
// const coords =[10,20]
// const [x,y]=coords;
//  const newCoord=[y];
//  console.log(newCoord);

// const response = {
//   data: [1, 2, 3]
// };

// const {data:[first,second,third]}=response;
// // console.log(first);
// const data1= first;
// console.log(data1);

// const user ={id:1, role:"Editor"}
// function FPD(role ="CodeDevPro"){
// console.log(role);
// }
// FPD(user.role);

// const state = {
//   auth: {
//     user: {
//       name: "Sara"
//     }
//   }
// };
// const {auth:{user:{name:userName}}}=state;
// console.log(userName);
// const username={auth:{user:{userName:"Sara"}}};
// console.log(username);

// const obj={}
 
//  const {...rest}=obj;
//  console.log(rest);

// const api = {
//   payload: {
//     result: {
//       value: 42
//     }
//   }
// };
// const {payload:{result:{value:answer}}}=api;
// console.log(answer);


// const defaults = { mode: "read", limit: 10 };
// const userOpts = { mode: "write" };
// const finalOpts = { ...defaults, ...userOpts };
// console.log(finalOpts);



// const a = { x: 1 };
// const b = { x: 2, y: 3 };

// const c = { ...a, ...b };
// console.log(c);

// const base = { config: { dark: false } };
// const override = { config: { dark: true } };
// const isAdmin={isAdmin:true}
// const result = { ...base, ...override,...isAdmin };
// console.log(result);

// const obj ={a:1}
// let {a,...rest}=obj;
// a=5;
// let obj1={...rest,a}
// console.log(obj1);

// console.log(obj);

// const a = [1, 2];
// const b = [3, 4];

// const c = [...a, ...b];
// console.log(c);

// function init(opts) {
//   const settings = {
//     mode: "read",
//     limit: 10,
//     ...opts
//   };

//   console.log(settings);
// }

// init({ limit: 5 });


// const user = { id: 1, password: "123" };
// let {id, ...rest}=user;
// let user1={id:2}
// console.log(user1);

// const base = { a: 1, b: 2 };
// const override = { b: undefined };

// const result = { ...base, ...override };
// console.log(result);

// Task: Write a function sum(...) that adds ANY amount of numbers.
// sum(1, 2) -> 3
// sum(1, 2, 3, 4) -> 10
// function sum(...numbers){
//     console.log(numbers);
//     return numbers.reduce((acc,curr)=>acc+curr,0);
// }

// console.log(sum(1,2,3,4));

// function calc(...nums) {
//   return nums.reduce((a, b) => a + b,0);
// }

// console.log(calc(1, 2, 3));

// const base = { a: 1, b: 2 };
// const extra = { b: 99, c: 3 };

// const result = { ...extra, ...base };
// console.log(result);

// const list = [3, 1, 2];


// let sort = [...list].sort();
// console.log(sort);
// console.log(list);

// let sortedList=list.sort();
// console.log(sortedList);
// console.log(list);

// const a = [4, 2, 9];
// const b = a.sort();

// console.log(a);
// console.log(b);



// const data = [{ x: 1 }, { x: 2 }];
// const copy = data.map(item=>({...item}));

// copy[0].x=99;



// console.log(data[0].x);
// console.log(copy[0].x);


// const users = [{ id: 1, meta: { score: 10 } }];

// const safe = users.map(u => ({...u,meta: { ...u.meta }}));


// safe[0].meta.score = 99;
// console.log(safe);
// console.log(users);

// const add = (a,b)=>a+b
// console.log(add(1,2));


// const max = (a, b) => a > b ? a : b

// console.log(max(1,2));

// const greet = (name = "Guest") => `Hello, ${name}!`

// console.log(greet("CodeDevPro"));

// const add = (a, b) => a + b
// console.log(add(2, "3")) // explicit conversion

// console.log(2 + "3" + 4);
// console.log(2 + 3 + "4");

// const add = (a, b) => +a + +b;
// console.log(add("2", "3")); // explicit conversion



// console.log("5" - "2");
// console.log("5" + -"2");


// console.log(true + true);
// console.log(false * true + 10 );


// console.log(10 + "2" * 3);


// const sum = (a, b) =>  a + b ;
// console.log(sum(2, 3));


// const add = (a, b) => +a + +b;

// console.log(add("2", "3"));
// console.log(parseInt("10px"));
// console.log(parseInt("10", 2));

// console.log("5" == 5);
// console.log("5" === 5);

// const prices = [10, 20];

// const strings = prices.map(p => p.toFixed(2));
// console.log(strings);

// const nums = [1.005, 2.345];

// const fixed = nums.map(n => n.toFixed(2));
// console.log(fixed);

// const prices = [10, 20];

// const total = prices
//   .map(p => p.toFixed(2))
//   .reduce((a, b) => a + b);

// console.log(total);

// const prices = [10, 20];

// const total= prices.map(p=>+p.toFixed(2)).reduce((a,b)=>a+b);
// console.log(total);

// const values = ["10.50", "20.25"];

// const sum = values
//   .map(v => Number(v).toFixed(2))
//   .reduce((a, b) => a + Number(b), 0);

// console.log(sum);

// const nums = [1, 2, 3];

// const result = nums.map(n => n + "0");
// console.log(result);

// console.log(0.1 + 0.2);
// console.log((0.1 + 0.2).toFixed(2));


// const records = [
//   { id: 1, valid: true },
//   { id: 2, valid: false }
// ];

// const valid = records.filter(r => r.valid);
// console.log(valid);


// const data = [0, 1, false, true, "", "ok"];

// const clean = data.filter(Boolean);
// console.log(clean);

// const users = [
//   { name: "A", active: true },
//   { name: "B" }
// ];

// const active = users.filter(u => u.active);
// console.log(active);


// const items = [
//   { price: 10, inStock: true },
//   { price: 0, inStock: true },
//   { price: 5, inStock: false }
// ];

// const available = items.filter(i => i.price && i.inStock);
// console.log(available);


// const flags = [true, false, true];

// const result = flags.filter(f => f === true);
// console.log(result);


// const nums = [2, 4, 6, 7, 8];

// console.log(nums.find(n => n % 2 !== 0)); // returns first element that satisfies the condition
// console.log(nums.filter(n => n % 2 !== 0)); // returns all elements that satisfy the condition

// const users = [
//   { name: "A", score: 50 },
//   { name: "B", score: 80 },
//   { name: "C", score: 30 }
// ];

// const names = users
//   .filter(u => u.score >= 60)
//   .map(u => u.name);

// console.log(names);


//  setTimeout(()=> console.log("CodeDevPro"),1000);

// console.log("A");

// setTimeout(() => console.log("B"), 0);

// console.log("C");


// setTimeout(() => console.log("First"), 1000);
// setTimeout(() => console.log("Second"), 0);

// for (var i = 1; i <= 3; i++) {
//   setTimeout(() => console.log(i), 1000);
// }

// for (let i = 1; i <= 3; i++) {
//   setTimeout(() => console.log(i), i * 1000);
// }

// setTimeout(() => {
//   console.log("Outer");

//   setTimeout(() => {
//     console.log("Inner");
//   }, 0);

// }, 0);


// console.log("Start");

// setTimeout(() => console.log("Timeout"), 0);

// for (let i = 0; i < 1000000000; i++) {
//     console.log(i);
// }

// console.log("End");

// setTimeout(() => console.log("Timeout"), 0);

// Promise.resolve().then(() => console.log("Promise"));


// Promise.reject("Error!").catch(e => console.log(e));


// Promise.reject("Xx")
//   .catch(e => {
//     console.log(e);
//     return add(1,2);
//   })
//   .then(v => console.log(v));

//   function add(a,b){
//     return a+b;
//   }


// Promise.resolve()
//   .then(() => {
//     throw new Error("Boom");
//   })
//   .catch(e => console.log(e));
  
// Promise.reject("Oops").catch(e => console.log(e));


// console.log("After");
// Promise.resolve(1)
//   .then(v => v + 1)
//   .then(v => Promise.reject(v))
//   .then(v => console.log(v))
//   .catch(e => console.log("Error:", e));

// Promise.reject("Fail")
//   .finally(() => console.log("Cleanup"))
//   .catch(e => console.log(e));

// setTimeout(() => console.log("Timeout"), 0);

// Promise.resolve().then(() => console.log("Promise"));


// Promise.resolve(
//   Promise.resolve("Inner")
// ).then(v => console.log(v));

// async function test() {
//   return Promise.reject("Error");
// }

// test().catch(e => console.log(e));


// async function getData() {
//   const data = await fetch('https://dummyjson.com/products').then(res=>res.json()).catch(e=>console.log(e));
//   console.log(data);
// }

// getData();

// async function test() {
//   const result = await fetch("https://dummyjson.com/products").then(res=>res.json()).catch(e=>console.log(e));
// //   console.log(result);
// }

// test();

// async function getValue() {
//   return await fetch("https://dummyjson.com/products").then(res=>res.json()).catch(e=>console.log(e));
// }

// getValue().then(v => console.log(v));


// async function load() {
//   throw "Failed";
// }

// load().catch(e => console.log(e));


// async function run() {
//   try {
//     await Promise.reject("Error");
//   } catch (e) {
//     console.log("Caught:", e);
//   }
// }
// run();


// async function fetchAll() {
//   const a = await fetch("/a");
//   const b = await fetch("/b");
//   console.log(a,b);
// }

// fetchAll();

// const nums = [1, 2, 3];

// const result = nums.map(async n => {
//   return n * 2;
// });

// console.log(result);


// async function run() {
//   [2, 1, 3].forEach(async n => {
//     await new Promise(r => setTimeout(r, 1000));
//     console.log(n);
//   });
// }
// run();
// async function run() {
//   for(let n of [2,1,3]){
//     await new Promise(r => setTimeout(r, 1000));
//     console.log(n);
//   }
// }
// run();

// function createSecret(secret){
//     let _secret = `Password: ${secret}`;
//     return {
//         getSecret: () => _secret,
//         setSecret: (secret) => _secret = secret
//     }
// }



// const vault = createSecret("CodeDevPro");
// console.log(vault.getSecret()); // "123"
// vault.setSecret("999");
// console.log(vault.getSecret()); // "999"


// const a = createSecret();
// const b = createSecret();

// a.setSecret("A");
// console.log(a.getSecret());

// function counter() {
//   let count = 0;
//   return {
//     inc: () => count++,
//     get: () => count
//   };
// }

// const c = counter();
// c.inc();
// c.inc();
// console.log(c.get());

// function makeFns() {
//   const fns = [];
//   for (let i = 0; i < 3; i++) {
//     fns.push(() => i);
//   }
//   return fns;
// }

// const fns1 = makeFns();
// console.log(fns1[0](), fns1[1](), fns1[2]());

// function createConfig() {
//   let mode = "dev";

//   return {
//     setMode(m) {
//       if (m !== "pro") return;
//       mode = m;
//     },
//     getMode() {
//       return mode;
//     }
//   };
// }

// const config = createConfig();
// config.setMode("pro");
// console.log(config.getMode());


// function x(){
//     let a=10;
//    return ()=>{
//         console.log(a);
//     }
// }

// const z = x();
// z();

// function x(){
//     let i=1
//     setTimeout(()=>{
//         console.log(i);
//     },1000)

// }
// x();

// console.log("Hello World");


// let name ={
//     firstName: "John",
//     lastName: "Doe",
   
// }
// let printFullName = function(){
//     console.log(this.firstName + " " + this.lastName);
// }
// printFullName.call(name);

// let name2 = {
//     firstName: "Jane",
//     lastName: "Doe"
// }

// printFullName.call(name2);

// let prnt=printFullName.bind(name);
// prnt();


// document.getElementById("grandparent").addEventListener("click",(e)=>{
//     console.log("Grandparent clicked");
    
//     e.target.style.backgroundColor = "yellow";
//     e.stopPropagation();
// },false);
// document.getElementById("parent").addEventListener("click",(e)=>{
//     console.log("Parent clicked");
    
//     e.target.style.backgroundColor = "red";
//     e.stopPropagation();
// },false);
// document.getElementById("child").addEventListener("click",(e)=>{
//     console.log("Child clicked");
//     e.target.style.backgroundColor = "green";
//    e.stopPropagation();
// },false);