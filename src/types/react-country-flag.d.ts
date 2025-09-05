declare module 'react-country-flag' {
  import { ComponentType } from 'react';

  interface ReactCountryFlagProps {
    countryCode: string;
    svg?: boolean;
    style?: React.CSSProperties;
    className?: string;
    title?: string;
  }

  const ReactCountryFlag: ComponentType<ReactCountryFlagProps>;
  export default ReactCountryFlag;
}
