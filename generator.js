const data = require('./data')
const fs = require('fs')

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function shrinkFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function createFields(obj) {
  const fields = []
  let arrayIndex = 0

  function addFields(index, obj, section, type) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      const upperKey = key.replace(/([A-Z])/g, '_$1').toUpperCase()

      if (typeof fields[index] === 'undefined') {
        fields[index] = { section: 'BaseFields' }
      }

      if (typeof section !== 'undefined') {
        fields[index] = {
          ...fields[index],
          section: capitalizeFirstLetter(section),
          type,
        }
      }

      fields[index][upperKey] = key

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null
        ) {
          arrayIndex++
          addFields(index + arrayIndex, value[0], key, 'array')
        }
      } else if (typeof value === 'object' && value !== null) {
        addFields(index + 1, value, key, 'object')
      }
    })
  }

  addFields(0, obj)

  return fields
}

function convertToJSONString(data) {
  let jsonString = ''

  // Iterate through each object in the data array
  data.forEach((obj) => {
    // Check if the object has a 'section' property
    jsonString += `export const ${obj.section} = ${JSON.stringify(
      { ...obj, section: undefined, type: undefined },
      null,
      2
    )} as const \n`
  })

  return jsonString
}

const f1 = createFields(data)

function getInitialValue(sections) {
  let initialValues = ''

  function stringifyFields(fields) {
    if (initialValues.search(fields.section && fields.type)) {
      const start = fields.type === 'array' ? '[\n{\n' : '{\n'
      const end = fields.type === 'array' ? '}\n]\n' : '}\n'

      const subField = Object.entries(fields).reduce((start, [key, value]) => {
        if (key === 'section' || key === 'type') {
          return start
        }

        return (start += `\t[${fields.section}.${key}]:'${value}', \n`)
      }, start)

      initialValues = initialValues.replace(
        `'${shrinkFirstLetter(fields.section)}'`,
        subField + end
      )
      return
    }

    Object.entries(fields).forEach(([key, value]) => {
      if (key !== 'section' && key !== 'type') {
        initialValues += `[${fields.section}.${key}]:'${value}', \n`
      }
    })
  }

  // upewnij się że baseFields jest pierwsze
  /* The line `const regex = /'(.*?)'/;` is creating a regular expression in JavaScript. */
  sections.forEach((section) => {
    stringifyFields(section)
  })

  const regex = /'(.*?)'/

  return JSON.parse(
    JSON.stringify(`{\n${initialValues}\n}`).replace(
      new RegExp(regex, 'g'),
      'undefined'
    )
  )
}

const initialValue = getInitialValue(f1)
const helpers = convertToJSONString(f1)

console.log(f1, initialValue)

function writeDataToDisk(fileName, data) {
  try {
    fs.writeFile(
      `./../${fileName}.ts`,
      JSON.parse(JSON.stringify(data)),
      (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`)
          return
        }

        console.log(`Successfully wrote data to ${fileName}`)
      }
    )
  } catch (error) {
    console.log('File write error:', error)
  }
}

// Prompt the user for the filename
const fileName = process.argv[2] // Assuming the filename is the second argument

// Write data to the specified filename

if (fileName) {
  ;[
    {
      postFix: 'helpers',
      data: `${helpers}`,
    },
    {
      postFix: 'initialValues',
      data: `
      import { ${f1.reduce(
        (start, fields) => start + fields.section + ', ',
        ''
      )}} from './${fileName}.helpers'
      
      
      export const initialValues = ${initialValue}`,
    },
    {
      postFix: 'validation',
      data: `
      import * as Yup from 'yup';

      export const validationSchema = Yup.object().shape({});
      
      `,
    },
    {
      postFix: 'form',
      data: `
      
      import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSnackbar } from '@mbank-design/design-system/hooks';
import { useFormikContext } from 'formik';

import { useGetApplicationCustomer } from '../../../api/endpoints/clientAccessFromFileSpecWithTransformer';
import { useCaseIdFromUrl } from '../../../hooks/useCaseIdFromUrl/useCaseIdFromUrl';
import { useScrollToFirstFormError } from '../../../hooks/useScrollToFirstFormError/useScrollToFirstFormError';
import { OfferDetailsPopup } from '../Start/components/OfferDetailsPopup';
import { FormSubmitButtons } from '../components/FormSubmitButtons';
import { initialValues } from './${fileName}.initialvalues';

const ${fileName}Form = ({
  isStagesLoading,
}: {
  isStagesLoading: boolean;
}): JSX.Element => {
  const [isOpenDetailsPopup, setIsOpenDetailsPopup] = useState(false);
  const navigate = useNavigate();
  const { addSnackbar } = useSnackbar();
  const { caseId } = useCaseIdFromUrl();

  const { values, errors, setFieldValue, isSubmitting } =
    useFormikContext<typeof initialValues>();

  useScrollToFirstFormError({ errors, isSubmitting });

  const { isLoading } = useGet(caseId ?? '', {
    query: {
      onSuccess: data => {
        // setFieldValue();
      },

      onError: error => {
        if (error.status !== 404) {
          addSnackbar({
            content: 'nie udało się pobrać danych',
            type: 'error',
          });
        }
      },
    },
  });

  console.log('error', errors);

  return (
    <Fragment>
      <FormSubmitButtons
        isSubmitLoading={isSubmitting || isStagesLoading}
        handleBack={() => {
          navigate(-1);
        }}
        handleSaveProposal={() => setIsOpenDetailsPopup(true)}
      />

      <OfferDetailsPopup isOpen={isOpenDetailsPopup} onClose={() => setIsOpenDetailsPopup(false)} />
    </Fragment>
  );
};

export default ${fileName}Form;

      `,
    },

    {
      postFix: undefined,
      data: `
      import React from 'react';

import { Box, Text } from '@mbank-design/design-system/components';
import { Form, Formik, FormikHelpers } from 'formik';

import { useFormikBackedErrors } from '../../../hooks/useFormikBackedErrors/useFormikBackedErrors';
import { useStageNavigate } from '../../../hooks/useStageNavigate/useStageNavigate';
import { initialValues } from './${fileName}.initialvalues';
import { validationSchema } from './${fileName}.validation';
import ${fileName}Form from './${fileName}.form';

export function ${fileName}(): JSX.Element {
  const { handleFormikBackendErrors } = useFormikBackedErrors();

  const { mutateAsync: saveForm, isSuccess, isLoading } = useSaveForm();

  const { isLoading: isStagesLoading } = useStageNavigate({
    enabled: isSuccess,
    currentStep: 'STEP',
  });

  async function handleSubmit(
    values: typeof initialValues ,
    { setFieldError }: FormikHelpers<typeof initialValues >
  ) {
    console.log('submit', values);

    try {
      await saveForm({
        data: {},
      });
    } catch (error) {
      handleFormikBackendErrors({
        error,
        setFieldError,
        fallbackCustomErrorMessage: 'coś poszło nie tak ',
      });

      return;
    }
  }

  return (
    <Box maxWidth={['100%', 864]}>
      <Text as="h2">${fileName}</Text>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        enableReinitialize={true}
      >
        <Form id="add-some-id">
          <ApplicationReceiversForm isStagesLoading={isStagesLoading || isLoading} />
        </Form>
      </Formik>
    </Box>
  );
}
      
      `,
    },
  ].forEach((file) =>
    writeDataToDisk(
      file.postFix ? `${fileName}.${file.postFix}` : fileName,
      file.data
    )
  )
} else {
  console.error('Please provide a filename as an argument.')
}
