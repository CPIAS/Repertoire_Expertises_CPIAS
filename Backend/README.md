# LOG8970

<p>Final integrator project in software engineering - Polytechnique Montreal.</p>

## Description

<p>A server for the search engine and networking platform in the healthcare AI field.</p>

## How to setup the server ?

<p>The server must be installed on Ubuntu (22.04 AMD64). To do this, simply run the following script:</p>

    usage: ./setup.sh

## Note
<p>It's recommended to install the server on an <i>AWS EC2</i> instance, as this will enable the application to automatically retrieve the instance's public hostname.</p>
<p>If installed on <i>AWS</i>, make sure that  <strong>Instance metadata service</strong> is <strong>enabled</strong> and that the <strong>IMDSv2</strong> option is set to <strong>Optional</strong>.</p>
<p>If installed on another cloud provider, be sure to manually enter the <strong>instance's public hostname</strong> in the <strong>PUBLIC_HOSTNAME</strong> variable of the <strong>setup.sh</strong> script.</p>