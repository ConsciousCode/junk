function $t(t, f) {
	t();
}
function $f(t, f) {
	f();
}

function not(a, k) {
	a(
		() => k(f),
		() => k(t)
	);
}

function and(a, b, k) {
	let f = () => k($f);
	a(() => b(() => k($t), f), f);
}

function or(a, b, k) {
	let t = () => k($t);
	a(t, () => b(t, () => k($f)));
}

function cons(car, cdr) {
	return k => k(car, cdr);
}

true = [a b](a)
false = [a b](b)
cons = [a b]([k](k a b))
car = [c]([a b] a)
cdr = [c]([a b] b)
