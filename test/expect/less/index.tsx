import React from 'react';
import Alert from "antd/lib/alert";
import "antd/lib/Alert/style/index.less";
import { default as S } from "antd/lib/affix";
import "antd/lib/Affix/style/index.less";
import AutoComplete from "antd/lib/auto-complete";
import "antd/lib/AutoComplete/style/index.less";
import { OtherComponent } from './other';
import { forEach } from 'lodash';
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>);
    }
}
