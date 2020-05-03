const kerntable = `A G -1
A T -1
A V -1
A W -1
A Y -1
C O -1
D A -1
K A 0
K O -1
L T -1
L V -1
O W -1
R Y -1
T A -1
T O -1
V A -1
V a -1
V c -1
V e -1
V o -1
W A -1
W c -1
W e -1
W o -1
Y A -1
Y c -1
Y e -1
Y o -1
c V -1
c W -1
c Y -1
c o -1
e V -1
e W -1
e Y -1
e w -1
o V -1
o W -1
o Y -1
o v -1
o w -1
o y -1
r o -1
v a -1
v d -1
v e -1
v o -1
v a.alt -1
v , -1
v . -1
w e -1
w o -1
w , -1
w . -1
y e -1
y o -1
y , -1
y . -1
/ \ -2
/ \ 1
\ \ -2
n d -1
e r 1
e l 1
v e -1
e v -1
t o -1
r a -1
r e -1
V a -2
L e -1
a r 1
s t -1
t a -1
t e -1
u r 1
r s -1
n s -1
b y -1
4 5 -1`.trim()
  .split('\n')
  .map(line => line.trim().split(' '))
  .reduce((res, [a, b, val]) => {
    const ca = a.charCodeAt(0) - 32;
    const cb = b.charCodeAt(0) - 32;
    if (!res[ca]) res[ca] = {};
    res[ca][cb] = Math.round(parseInt(val) / 80);
    console.log(a, b, Math.round(parseInt(val) / 80));
    return res;
  }, {});

for (ca in kerntable) {
  for (cb in kerntable[ca]) {
    //console.log(ca, cb, kerntable[ca][cb])
    //const a = ca << 
  }
}
// console.log(ca, cb, 2 + Math.round(parseInt(val) / 80));
// return res;