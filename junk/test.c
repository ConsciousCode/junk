#define str(s) #s
#define esc(...) __VA_ARGS__
#define defun(raw) mkfun< [](Data* __arg) { defun2 raw } >
#define defun2(...) auto& args = ((Tuple<__VA_ARGS__>*)__arg)->data;

int main() {
printf(defun((a, b, c) { hello }));
return 0;
}

