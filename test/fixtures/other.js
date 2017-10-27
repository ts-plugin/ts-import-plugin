import React from 'react'
import { Card, Alert as A } from 'antd';;
import { concat } from "lodash"
import { NavigationArrowBack, ContentAddBox, DeviceAccessAlarm, DeviceBattery20 } from 'material-ui/svg-icons'

export class OtherComponent extends React.PureComponent {
  render() {
    return (
      <Card>
        <div>this is card</div>
      </Card>
    )
  }
}
