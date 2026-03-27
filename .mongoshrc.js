prompt = () => {
  const isPro = db.hello().me.includes('zazumepro');
  if (isPro) {
    return '\033[31mPRODUCTION \033[0m';
  }
  return;
}
