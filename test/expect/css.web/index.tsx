import React from 'react';
import Alert from "antd/lib/alert";
import "antd/lib/alert/style/css.web.js";
import { default as S } from "antd/lib/affix";
import "antd/lib/affix/style/css.web.js";
import AutoComplete from "antd/lib/auto-complete";
import "antd/lib/auto-complete/style/css.web.js";
import { Drawer, MenuItemProps } from 'material-ui';
import { OtherComponent } from './other';
import { forEach } from 'lodash';
import { skip, take, switchMap as SwitchMap } from 'rxjs/operators';
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>);
    }
}
