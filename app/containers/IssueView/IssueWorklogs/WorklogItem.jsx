// @flow
import React from 'react';
import moment from 'moment';
import type { StatelessFunctionalComponent, Node } from 'react';
import { Flex } from 'components';
import { openWorklogInBrowser } from 'external-open-util';
import Tooltip from '@atlaskit/tooltip';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import LinkIcon from '@atlaskit/icon/glyph/link';
import TrashIcon from '@atlaskit/icon/glyph/trash';

import type { Worklog, DeleteWorklogRequest, EditWorklogRequest } from '../../../types';

import {
  WorklogContainer,
  UserAvatar,
  WorklogActions,
} from './styled';

type Props = {
  worklog: Worklog,
  issueKey: string,
  deleteWorklogRequest: DeleteWorklogRequest,
  editWorklogRequest: EditWorklogRequest,
};

const WorklogItem: StatelessFunctionalComponent<Props> = ({
  worklog,
  issueKey,
  deleteWorklogRequest,
  editWorklogRequest,
}: Props): Node => (
  <WorklogContainer id={`worklog-${worklog.id}`}>
    <Flex row alignCenter>
      <UserAvatar src={worklog.author.avatarUrls['32x32']} />
      {worklog.author.displayName} logged
      work – {moment(worklog.started).format('DD/MMM/YY h:mm A')}
      <WorklogActions>
        <Tooltip description="Open worklog in JIRA">
          <LinkIcon onClick={openWorklogInBrowser(worklog, issueKey)} />
        </Tooltip>
        <Tooltip description="Edit worklog">
          <EditFilledIcon onClick={() => editWorklogRequest(worklog)} />
        </Tooltip>
        <Tooltip description="Delete worklog" position="left">
          <TrashIcon onClick={() => deleteWorklogRequest(worklog)} />
        </Tooltip>
      </WorklogActions>
    </Flex>
    <Flex row alignCenter style={{ marginLeft: 32 }}>
      <span style={{ color: '#5e6c84' }}>Time spent:</span>&nbsp;{worklog.timeSpent}
    </Flex>
    <Flex row alignCenter style={{ marginLeft: 32 }}>
      <span style={{ color: '#5e6c84' }}>Comment:</span>&nbsp;{worklog.comment || '<no comment>'}
    </Flex>
  </WorklogContainer>
);

export default WorklogItem;
