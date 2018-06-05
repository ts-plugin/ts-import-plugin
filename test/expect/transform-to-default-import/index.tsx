import React from 'react';
import { Alert, Affix as S, AutoComplete } from 'antd';
import { Drawer, MenuItemProps } from 'material-ui';
import { OtherComponent } from './other';
import { forEach } from 'lodash';
import { skip } from "rxjs/_esm2015/internal/operators/skip";
import { take } from "rxjs/_esm2015/internal/operators/take";
import { switchMap as SwitchMap } from "rxjs/_esm2015/internal/operators/switchMap";
export class Test extends React.PureComponent<void, void> {
    render() {
        return (<OtherComponent>
        <Alert message='hello world'/>
      </OtherComponent>);
    }
}
