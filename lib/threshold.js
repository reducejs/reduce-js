module.exports = function (threshold, commonFilter) {
  return function (row, group) {
    return filter(row.file, commonFilter) || th(row, group, threshold);
  };
};

function filter(file, pattern) {
  if (!pattern) {
    return false;
  }
  if (typeof pattern === 'string') {
    return pattern === file;
  }
  if (typeof pattern === 'function') {
    return pattern(file);
  }
  if (typeof pattern.test === 'function') {
    return pattern.test(file);
  }
  if (Array.isArray(pattern)) {
    return pattern.some(filter.bind(null, file));
  }
  return false;
}

function th(row, group, val) {
  if (typeof row.common === 'boolean') {
    return row.common;
  }
  if (typeof val === 'function') {
    return val(row, group);
  }
  return group.length > (+val || 1) || group.length === 0;
}

