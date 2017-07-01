import React from 'react';
import Card from "antd/lib/card";
import "antd/lib/Card/style/index.less";
import { default as A } from "antd/lib/alert";
import "antd/lib/Alert/style/index.less";
;
import { concat } from 'lodash';
export class OtherComponent extends React.PureComponent {
    render() {
        return (<Card>
        <div>this is card</div>
      </Card>);
    }
}
