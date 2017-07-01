import React from 'react';
import Card from "antd/lib/card";
import "antd/lib/card/style/index.css";
import { default as A } from "antd/lib/alert";
import "antd/lib/alert/style/index.css";
;
import { concat } from 'lodash';
export class OtherComponent extends React.PureComponent {
    render() {
        return (<Card>
        <div>this is card</div>
      </Card>);
    }
}
