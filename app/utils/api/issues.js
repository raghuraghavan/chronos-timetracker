import jira from '../jiraClient';

const requiredFields = [
  'issuetype',
  'project',
  'labels',
  'priority',
  'status',
  'resolution',
  'summary',
  'reporter',
  'assignee',
  'description',
  'worklog',
  'timeestimate',
  'timespent',
  'fixVersions',
  'versions',
  'components',
];

function mapAssignee(assigneeId) {
  switch (assigneeId) {
    case 'none':
      return 'assignee is EMPTY';
    case 'currentUser':
      return 'assignee = currentUser()';
    default:
      return '';
  }
}

export function fetchFields() {

}

export function fetchIssues({
  startIndex,
  stopIndex,
  projectId,
  projectType,
  sprintId,
  searchValue,
  filters,
}) {
  const typeFilters = filters.type;
  const statusFilters = filters.status;
  const assigneeFilter = filters.assignee[0];
  const jql = [
    (projectType === 'project' ? `project = ${projectId}` : ''),
    ((projectType === 'scrum') && sprintId ? `sprint = ${sprintId}` : ''),
    (searchValue ? `summary ~ ${searchValue}` : ''),
    (typeFilters.length ? `issueType in (${typeFilters.join(',')})` : ''),
    (statusFilters.length ? `status in (${statusFilters.join(',')})` : ''),
    (assigneeFilter !== 'unassigned' ? 'assignee = currentUser()' : 'assignee is EMPTY'),
  ].filter(f => !!f).join(' AND ');
  const api = projectType === 'project'
    ? opts => jira.client.search.search(opts)
    : opts => jira.client.board.getIssuesForBoard({ ...opts, boardId: projectId });
  return api({
    jql,
    maxResults: stopIndex - startIndex,
    startAt: startIndex,
    fields: requiredFields,
  });
}

export function fetchIssue(issueId) {
  return jira.client.issue.getIssue({
    issueId,
    fields: requiredFields,
  });
}


export function fetchRecentIssues({
  projectId,
  projectType,
  sprintId,
  worklogAuthor,
}) {
  const jql = [
    (projectType === 'project' ? `project = ${projectId}` : ''),
    ((projectType === 'scrum') && sprintId ? `sprint = ${sprintId}` : ''),
    `worklogAuthor = ${worklogAuthor} `,
    'timespent > 0 AND worklogDate >= "-4w"',
  ].filter(f => !!f).join(' AND ');

  const api = projectType === 'project'
    ? opts => jira.client.search.search(opts)
    : opts => jira.client.board.getIssuesForBoard({ ...opts, boardId: projectId });

  return api({
    jql,
    maxResults: 1000,
    fields: requiredFields,
  });
}

export function fetchSearchIssues({
  projectId,
  projectType,
  sprintId,
  projectKey,
  searchValue,
}) {
  return new Promise((resolve) => {
    const promises = [];
    const searchValueWithKey = (projectType === 'project') && (/^\d+$/.test(searchValue))
      ? `${projectKey}-${searchValue}`
      : searchValue;

    const api = projectType === 'project'
      ? (opts, callback) => jira.client.search.search(opts, callback)
      : (opts, callback) => jira.client.board.getIssuesForBoard(
        { ...opts, boardId: projectId },
      callback,
    );

    const project = projectType === 'project' ? `project = ${projectId}` : '';
    const sprint = (projectType === 'scrum') && sprintId ? `sprint = ${sprintId}` : '';

    promises.push(new Promise((r) => {
      api({
        jql: [
          project,
          sprint,
          `issuekey = "${searchValueWithKey}"`,
        ].filter(f => !!f).join(' AND '),
        maxResults: 1000,
        fields: requiredFields,
      }, (error, response) => r(response ? response.issues : []));
    }));

    promises.push(new Promise((r) => {
      api({
        jql: [
          project,
          sprint,
          `summary ~ "${searchValue}"`,
        ].filter(f => !!f).join(' AND '),
        maxResults: 1000,
        fields: requiredFields,
      }, (error, response) => r(response ? response.issues : []));
    }));

    Promise.all(promises).then((results) => {
      const items = [].concat(...results.map(i => i));
      resolve(items);
    });
  });
}
