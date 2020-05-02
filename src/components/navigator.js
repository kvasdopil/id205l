module.exports = (screens) => () => {
  let index;
  let page;
  let result = {};

  let navigate;
  navigate = (n) => {
    if (n === index || !screens[n]) return;
    if (page) page.onStop();
    index = n;
    page = screens[index](navigate);
    result.onStop = page.onStop;
    result.onTap = page.onTap;
    result.onLongTap = page.onLongTap;
    result.sleep = page.sleep;
    result.isApp = n > 0;
  }

  navigate(0);

  return result;
};